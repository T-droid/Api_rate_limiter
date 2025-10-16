import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ApiKey, ApiKeySchema } from "src/schema/api-key.shema";
import { KeyService } from "src/services/key.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }])],
    providers: [KeyService],
    exports: [KeyService]
})
export class KeyModule {}