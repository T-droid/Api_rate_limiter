import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true })
export class Audit {
    @Prop({ required: true })
    actorId: string;

    @Prop({ required: true })
    action: string;

    @Prop({ default: {} })
    metadata: Record<string, any>
};

export const AuditSchema = SchemaFactory.createForClass(Audit);