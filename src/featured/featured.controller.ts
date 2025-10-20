import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('featured')
export class FeaturedController {
    @Get()
    @UseGuards(ApiKeyGuard)
    async accessFeaturedRoute() {
        return { message: "Successfully consumed this api"};
    }
}
