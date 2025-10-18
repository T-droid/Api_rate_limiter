import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./user.schema";
import { PasswordUtil } from "src/utils/password.util";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        PasswordUtil,
    ],
    exports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])]
})
export class UserModule {};