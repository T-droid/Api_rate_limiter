import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiKey, ApiKeyDocument } from './keys.schema';
import mongoose, { Model } from 'mongoose';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class KeysService {
    constructor(@InjectModel(ApiKey.name) private apikeyModel: Model<ApiKeyDocument>) {}

    async generateKey(userId: string): Promise<{ apiKey: string }> {
        const rawKey = `sk-${randomBytes(24).toString('hex')}`;
        const keyHash = this.hashKey(rawKey);

        await this.apikeyModel.create({ keyHash, user: userId });

        return { apiKey: rawKey };
    }

    async validateKey(rawKey: string) {
        const keyHash = this.hashKey(rawKey);
        const record = await this.apikeyModel.findOne({ keyHash, active: true });

        if (!record) throw new UnauthorizedException('Invalid API Key');

        record.usageCount++;
        record.lastUsedAt = new Date();
        await record.save();

        return record.user;
    }

    private hashKey(key: string): string {
        return createHash('sha256').update(key).digest('hex');
    }

    async getUserKeys(userId: string) {
        return await this.apikeyModel.find({ user: userId }).populate('user', 'name email organization');
    }

    async deleteKey(keyId: string, userId: string): Promise<boolean> {
        return (await this.apikeyModel.deleteOne({ _id: new mongoose.Types.ObjectId(keyId), user: userId })).acknowledged;
    }
}
