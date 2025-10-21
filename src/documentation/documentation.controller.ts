import { Controller, Get, Post, Render, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('documentation')
export class DocumentationController {
    @Get()
    @Render('documentation')
    getDocumentation() {
        return {
            title: 'API Documentation'
        };
    }

    @Post('featured')
    @UseGuards(ApiKeyGuard)
    async accessFeaturedRoute() {
        return { message: "Successfully consumed this api"};
    }
}
