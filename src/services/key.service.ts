import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKey, ApiKeyDocument } from "src/schema/api-key.shema";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";


@Injectable()
export class KeyService {
    private readonly logger = new Logger(KeyService.name);
    constructor(
        @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
    ) {}

    private async hashSecret(secret: string) {
        const saltRounds = Number(process.env.API_KEY_SECRET_SALT_ROUNDS || 10);
        return bcrypt.hash(secret, saltRounds);
    }

    private generateSecretPair(){
        const keyId = `k_${uuidv4().slice(0, 8)}`;
        const secret = uuidv4().replace(/-/g, '') + uuidv4().slice(0, 8);
        const composite = `${keyId}.${secret}`;
        return  { keyId, secret, composite };
    }

    async create(createDto: { ownerId: string; limit?: number; windowSeconds?: number; scopes?: string[] }) {
        const {
            ownerId,
            limit = Number(process.env.DEFAULT_RATE_LIMIT || 100),
            windowSeconds = Number(process.env.DEFAULT_RATE_WINDOW_SECONDS || 60),
            scopes = []
        } = createDto;
        const { keyId, secret, composite } = await this.generateSecretPair();
        const secretHash = await this.hashSecret(secret);

        const doc = await this.apiKeyModel.create({
            keyId,
            secretHash,
            ownerId,
            status: 'active',
            scopes,
            rateLimit: { limit, windowSeconds },
        });

        return { keyId: doc.keyId, secret: composite };
    }

    async findByKeyId(keyId: string) {
        return this.apiKeyModel.findOne({ keyId }).lean();
    }

    async verifySecret(providedComposite: string, dbRecord: ApiKeyDocument) {
        const parts = providedComposite.split('.');
        const secret = parts.slice(1).join('.');
        if (!secret) return false;
        return bcrypt.compare(secret, dbRecord.secretHash);
    }

    async revoke(keyId: string) {
        const r = await this.apiKeyModel.findByIdAndUpdate({ keyId }, { status: 'revoked' }, { new: true })
    }

    async rotate(keyId: string) {
        const { secret, composite } = (() => {
            const s = uuidv4().replace(/-/g, '') + uuidv4().slice(0, 8);
            return { secret: s, composite: `${keyId}.${s}`}
        })();

        const secretHash = await this.hashSecret(secret);
        const r = await this.apiKeyModel.findOneAndUpdate({ keyId }, { secretHash, status: 'active', $set: { rotatedAt: new Date() } }, { new: true });
        return { keyId, secret: composite };
    }
}