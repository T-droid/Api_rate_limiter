import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './analytics.schema';
import { KeysModule } from 'src/keys/keys.module';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([{ name: Analytics.name, schema: AnalyticsSchema}]),
    KeysModule
  ],
  exports: [RateLimiterService, KeysModule],
  providers: [RateLimiterService]
})
export class RateLimiterModule {}
