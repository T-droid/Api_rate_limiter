import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyModule } from './modules/key.module';
import { GateWayModule } from './modules/gateway.module';
import { UsageModule } from './modules/usage.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    KeyModule,
    GateWayModule,
    UsageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
