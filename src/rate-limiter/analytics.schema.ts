import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type AnalyticsDocument = HydratedDocument<Analytics>;

@Schema({ timestamps: true })
export class Analytics {
    @Prop({ type: String, required: true })
    apiKeyId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: Number, default: 0 })
    successfulCalls: number;

    @Prop({ type: Number, default: 0 })
    failedCalls: number;

    @Prop({ type: Number, default: 0 })
    rateLimitedCalls: number;

    @Prop({ type: Number, default: 0 })
    totalCalls: number;

    @Prop({ type: Date, default: Date.now })
    lastUpdated: Date;
}

export const AnalyticsSchema = SchemaFactory.createForClass(Analytics);

// Create compound index for efficient queries
AnalyticsSchema.index({ apiKeyId: 1, date: 1 }, { unique: true });
AnalyticsSchema.index({ userId: 1, date: 1 });
AnalyticsSchema.index({ date: 1 });