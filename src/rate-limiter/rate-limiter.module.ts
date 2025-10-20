import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from './analytics.schema';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([{ name: Analytics.name, schema: AnalyticsSchema}])
  ],
  exports: [RateLimiterService],
  providers: [RateLimiterService]
})
export class RateLimiterModule {}
