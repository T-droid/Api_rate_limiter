import { Controller, Get, Render, Request, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('')
    @UseGuards(AuthGuard)
    @Render('dashboard')
    async getDashboard(@Request() req) {
        const dashboardData = await this.dashboardService.getDashboardData(req.user.id);
        
        return { 
            user: req.user,
            title: 'Dashboard',
            dashboardData
        };
    }

    @Get('api/dashboard-data')
    @UseGuards(AuthGuard)
    async getDashboardData(@Request() req, @Res() res) {
        try {
            const dashboardData = await this.dashboardService.getDashboardData(req.user.id);
            res.json(dashboardData);
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            res.status(500).json({ error: 'Failed to load dashboard data' });
        }
    }

    @Get('api/rate-limit-status')
    @UseGuards(AuthGuard)
    async getRateLimitStatus(@Request() req, @Res() res) {
        try {
            const rateLimitStatus = await this.dashboardService.getRateLimitStatus(req.user.id);
            res.json(rateLimitStatus);
        } catch (error) {
            console.error('Error getting rate limit status:', error);
            res.status(500).json({ error: 'Failed to load rate limit status' });
        }
    }
}
