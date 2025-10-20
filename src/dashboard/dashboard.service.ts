import { Injectable } from '@nestjs/common';
import { RateLimiterService } from 'src/rate-limiter/rate-limiter.service';
import { KeysService } from 'src/keys/keys.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiKey, ApiKeyDocument } from 'src/keys/keys.schema';

@Injectable()
export class DashboardService {
    constructor(
        private readonly rateLimiterService: RateLimiterService,
        private readonly keysService: KeysService,
        @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>
    ) {}

    /**
     * Get comprehensive dashboard data for a user
     */
    async getDashboardData(userId: string) {
        try {
            // Get user's API keys
            const userApiKeys = await this.apiKeyModel.find({ user: userId }).lean();
            const userApiKeyIds = userApiKeys.map(key => key._id.toString());

            // Get analytics summary
            const analyticsData = await this.rateLimiterService.getUserAnalyticsSummary(userApiKeyIds, 7);

            // Get daily breakdown for the last 7 days
            const dailyAnalytics = await Promise.all(
                userApiKeyIds.map(keyId => 
                    this.rateLimiterService.getAnalyticsSummary(keyId, 7)
                )
            );

            // Flatten and aggregate daily data
            const dailyData = this.aggregateDailyData(dailyAnalytics);

            // Calculate additional metrics
            const metrics = this.calculateMetrics(userApiKeys, analyticsData, dailyData);

            return {
                // Overview metrics
                totalRequests: analyticsData.totalCalls || 0,
                successfulRequests: analyticsData.successfulCalls || 0,
                failedRequests: analyticsData.failedCalls || 0,
                rateLimitedRequests: analyticsData.rateLimitedCalls || 0,
                successRate: Math.round(analyticsData.successRate || 0),
                
                // API Keys info
                totalApiKeys: userApiKeys.length,
                activeApiKeys: userApiKeys.filter(key => key.active).length,
                
                // Time series data for charts
                dailyData,
                
                // Additional metrics
                ...metrics,
                
                // Recent activity (last 24 hours)
                recentActivity: await this.getRecentActivity(userApiKeyIds)
            };
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            return this.getDefaultDashboardData();
        }
    }

    /**
     * Aggregate daily analytics data from multiple API keys
     */
    private aggregateDailyData(dailyAnalytics: any[][]) {
        const aggregated = new Map();

        dailyAnalytics.forEach(keyData => {
            keyData.forEach(dayData => {
                const date = dayData.date;
                if (!aggregated.has(date)) {
                    aggregated.set(date, {
                        date,
                        totalCalls: 0,
                        successfulCalls: 0,
                        failedCalls: 0,
                        rateLimitedCalls: 0
                    });
                }

                const existing = aggregated.get(date);
                existing.totalCalls += dayData.totalCalls || 0;
                existing.successfulCalls += dayData.successfulCalls || 0;
                existing.failedCalls += dayData.failedCalls || 0;
                existing.rateLimitedCalls += dayData.rateLimitedCalls || 0;
            });
        });

        // Convert to array and sort by date
        return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Calculate additional metrics and trends
     */
    private calculateMetrics(apiKeys: any[], analyticsData: any, dailyData: any[]) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get today's and yesterday's data
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const todayData = dailyData.find(d => d.date === todayStr) || { totalCalls: 0 };
        const yesterdayData = dailyData.find(d => d.date === yesterdayStr) || { totalCalls: 0 };

        // Calculate trends
        const requestsTrend = this.calculateTrend(todayData.totalCalls, yesterdayData.totalCalls);

        // Calculate average requests per day
        const avgRequestsPerDay = dailyData.length > 0 
            ? Math.round(dailyData.reduce((sum, day) => sum + day.totalCalls, 0) / dailyData.length)
            : 0;

        // Most active API key
        const mostActiveKey = apiKeys.reduce((prev, current) => 
            (current.usageCount > (prev?.usageCount || 0)) ? current : prev, null
        );

        return {
            requestsTrend,
            avgRequestsPerDay,
            mostActiveKeyId: mostActiveKey?._id?.toString() || null,
            mostActiveKeyUsage: mostActiveKey?.usageCount || 0,
            errorRate: analyticsData.totalCalls > 0 
                ? Math.round(((analyticsData.failedCalls || 0) / analyticsData.totalCalls) * 100)
                : 0,
            rateLimitRate: analyticsData.totalCalls > 0
                ? Math.round(((analyticsData.rateLimitedCalls || 0) / analyticsData.totalCalls) * 100)
                : 0
        };
    }

    /**
     * Calculate percentage trend between two values
     */
    private calculateTrend(current: number, previous: number): { percentage: number; direction: 'up' | 'down' | 'stable' } {
        if (previous === 0) {
            return { percentage: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'stable' };
        }

        const percentage = Math.round(((current - previous) / previous) * 100);
        const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';

        return { percentage: Math.abs(percentage), direction };
    }

    /**
     * Get recent activity (placeholder for future implementation)
     */
    private async getRecentActivity(userApiKeyIds: string[]) {
        // This would typically fetch recent API calls from a logs collection
        // For now, return placeholder data with proper status text
        const statusTexts = {
            200: 'OK',
            201: 'Created', 
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            429: 'Too Many Requests',
            500: 'Internal Server Error'
        };

        const activities = [
            { method: 'GET', endpoint: '/users', status: 200, timestamp: new Date(Date.now() - 5 * 60 * 1000) },
            { method: 'POST', endpoint: '/orders', status: 201, timestamp: new Date(Date.now() - 10 * 60 * 1000) },
            { method: 'GET', endpoint: '/products', status: 200, timestamp: new Date(Date.now() - 15 * 60 * 1000) }
        ];

        return activities.map(activity => ({
            ...activity,
            statusText: statusTexts[activity.status] || 'Unknown'
        }));
    }

    /**
     * Get default dashboard data when there's no analytics data
     */
    private getDefaultDashboardData() {
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimitedRequests: 0,
            successRate: 0,
            totalApiKeys: 0,
            activeApiKeys: 0,
            dailyData: [],
            requestsTrend: { percentage: 0, direction: 'stable' as const },
            avgRequestsPerDay: 0,
            mostActiveKeyId: null,
            mostActiveKeyUsage: 0,
            errorRate: 0,
            rateLimitRate: 0,
            recentActivity: []
        };
    }

    /**
     * Get rate limit status for user's API keys
     */
    async getRateLimitStatus(userId: string) {
        try {
            const userApiKeys = await this.apiKeyModel.find({ user: userId, active: true }).lean();
            
            // For now, return aggregated rate limit info
            // This could be enhanced to show per-key rate limits
            const totalCapacity = userApiKeys.reduce((sum, key) => sum + (key.rateLimitCapacity || 60), 0);
            const usagePercentage = Math.min(75, Math.random() * 100); // Placeholder - replace with real data

            return {
                current: Math.round((usagePercentage / 100) * totalCapacity),
                limit: totalCapacity,
                percentage: Math.round(usagePercentage),
                resetTime: new Date(Date.now() + 3600000) // 1 hour from now
            };
        } catch (error) {
            console.error('Error getting rate limit status:', error);
            return {
                current: 0,
                limit: 1000,
                percentage: 0,
                resetTime: new Date(Date.now() + 3600000)
            };
        }
    }
}
