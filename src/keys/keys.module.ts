import { Module } from '@nestjs/common';
import { KeysService } from './keys.service';
import { KeysController } from './keys.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from './keys.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }])],
  exports: [KeysService],
  providers: [KeysService],
  controllers: [KeysController]
})
export class KeysModule {}
