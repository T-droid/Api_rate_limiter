import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('analytics')
export class AnalyticsController {
    @Get('summary')
    @UseGuards(AuthGuard)
    async getAnalyticsSummary(@Request() req) {
        // For now, return mock data
        // This would be replaced with real analytics logic later
        return {
            totalCalls: 12345,
            successfulCalls: 10200,
            totalCallsChange: 5,
            successfulCallsChange: 3,
            rateLimitHits: 245,
            topEndpoints: [
                { endpoint: '/users', calls: 1200, successRate: 98 },
                { endpoint: '/products', calls: 850, successRate: 95 },
                { endpoint: '/orders', calls: 600, successRate: 92 }
            ]
        };
    }
}
