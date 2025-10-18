import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { User } from "src/user/user.schema";

export type ApiKeyDocument = HydratedDocument<ApiKey>

@Schema({ timestamps: true })
export class ApiKey {
    @Prop({ required: true, unique: true })
    keyHash: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    user: User;

    @Prop({ default: true })
    active: boolean;

    @Prop({ default: 0 })
    usageCount: number;

    @Prop({ default: 60 })
    rateLimitCapacity: number;

    @Prop({ default: 1 })
    rateLimitRefillRate: number;

    @Prop({ default: 0 })
    totalRequests: number;

    @Prop({ default: 0 })
    totalRateLimited: number;

    @Prop()
    lastUsedAt?: Date;
};

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);