import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type DeveloperDocument = Developer & Document;


@Schema({ timestamps: true })
export class Developer {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    passwordHash: string;

};

export const DeveloperSchema = SchemaFactory.createForClass(Developer);