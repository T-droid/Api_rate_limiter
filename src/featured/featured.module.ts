import { Module } from '@nestjs/common';
import { FeaturedService } from './featured.service';

@Module({
  providers: [FeaturedService]
})
export class FeaturedModule {}
