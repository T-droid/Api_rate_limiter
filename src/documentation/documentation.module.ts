import { Module } from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { RateLimiterModule } from 'src/rate-limiter/rate-limiter.module';

@Module({
  imports: [RateLimiterModule],
  providers: [DocumentationService],
  controllers: [DocumentationController]
})
export class DocumentationModule {}
