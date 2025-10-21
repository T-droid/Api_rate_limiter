import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { RateLimiterModule } from 'src/rate-limiter/rate-limiter.module';
import { KeysModule } from 'src/keys/keys.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from 'src/keys/keys.schema';
import { Analytics, AnalyticsSchema } from 'src/rate-limiter/analytics.schema';

@Module({
  imports: [
    RateLimiterModule,
    KeysModule,
    MongooseModule.forFeature([
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: Analytics.name, schema: AnalyticsSchema }
    ])
  ],
  providers: [DashboardService],
  controllers: [DashboardController]
})
export class DashboardModule {}
