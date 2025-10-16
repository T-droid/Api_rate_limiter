import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose';

export type ApiKeyDocument = ApiKey & Document;

export type RateLimitConfig = {
    limit: number;
    windowSeconds: number;
};


@Schema({ timestamps: true })
export class ApiKey {
    @Prop({ required: true, index: true, unique: true })
    keyId: string;

    @Prop({ required: true })
    secretHash: string;

    @Prop({ required: true })
    ownerId: string;

    @Prop({ default: 'active', enum: ['active', 'revoked', 'rotating']})
    status: string;

    @Prop({ type: Array, default: [] })
    scopes: string[];

    @Prop({ type: Object, default: { limit: 100, windowSeconds: 60 } })
    rateLimit: RateLimitConfig;

    @Prop({ type: Object, default: {} })
    meta: Record<string, any>
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);