import { Module } from '@nestjs/common';
import { RateLimiterService } from './rate-limiter.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  exports: [RateLimiterService],
  providers: [RateLimiterService]
})
export class RateLimiterModule {}
