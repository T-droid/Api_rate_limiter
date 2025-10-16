import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


export type UsageSummaryDocument = UsageSummary & Document;

@Schema()
export class UsageSummary {
    @Prop({ required: true, index: true })
    keyId: string;

    @Prop({ required: true, index: true })
    date: string;

    @Prop() hour?: number;

    @Prop({ default: 0 })
    requests: number;

    @Prop({ default: 0 })
    errors: number;

    @Prop({ default: 0 })
    avgLatency: number;

    @Prop({ default: Date.now() })
    lastSeen: number;
}

export const UsageSummarySchema = SchemaFactory.createForClass(UsageSummary);