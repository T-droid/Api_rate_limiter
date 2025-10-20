import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { CacheApiKey } from 'src/types/apiKeyCache';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import mongoose from 'mongoose';
import { Analytics, AnalyticsDocument } from './analytics.schema';

@Injectable()
export class RateLimiterService {
    private bucketCapacity = 10;
    private fillRate = 1;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>
    ) {}

    async consume(apiKey: string, userId?: any): Promise<boolean> {
        const key = `rateLimit:${apiKey}:${userId}`;
        const cachedApiKey = await this.cacheManager.get<CacheApiKey>(key);
        
        if (!cachedApiKey) {
            const newBucket: CacheApiKey = {
                tokens: this.bucketCapacity - 1,
                lastFilled: Date.now()
            }
            await this.cacheManager.set(key, newBucket);
            
            // Track successful call
            await this.trackApiCall(apiKey, true, false, userId);
            return true;
        }

        const updatedBucket = this.refill(cachedApiKey);
        
        if (updatedBucket.tokens >= 1) {
            updatedBucket.tokens -= 1;
            await this.cacheManager.set(key, updatedBucket);
            
            // Track successful call
            await this.trackApiCall(apiKey, true, false, userId);
            return true;
        }

        await this.cacheManager.set(key, updatedBucket);
        
        // Track rate limited call
        await this.trackApiCall(apiKey, false, true, userId);
        return false;
    }
    
    private refill(cache: CacheApiKey): { tokens: number; lastFilled: number} {
        const now = Date.now();
        const elapsedTime = (now - cache.lastFilled) / 1000;
        const tokensToAdd = elapsedTime * this.fillRate;

        return {
            tokens: Math.min(this.bucketCapacity, cache.tokens + tokensToAdd),
            lastFilled: now
        }
    }

    /**
     * Track API call statistics in the analytics collection using daily aggregation
     */
    private async trackApiCall(apiKeyId: string, success: boolean, rateLimited: boolean = false, userId?: string) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Start of day

            const filter = {
                apiKeyId,
                date: today
            };

            const update = {
                $inc: {
                    totalCalls: 1,
                    ...(success && { successfulCalls: 1 }),
                    ...(!success && !rateLimited && { failedCalls: 1 }),
                    ...(rateLimited && { rateLimitedCalls: 1 })
                },
                $set: {
                    lastUpdated: new Date()
                },
                $setOnInsert: {
                    apiKeyId,
                    date: today,
                    ...(userId && { userId: new mongoose.Types.ObjectId(userId) })
                }
            };

            await this.analyticsModel.updateOne(filter, update, { upsert: true });
        } catch (error) {
            // Log error but don't fail the main operation
            console.error('Failed to track analytics:', error);
        }
    }

    /**
     * Public method to track API call errors from other services
     */
    async trackApiError(apiKeyId: string, userId?: string) {
        await this.trackApiCall(apiKeyId, false, false, userId);
    }

    /**
     * Get analytics summary for an API key
     */
    async getAnalyticsSummary(apiKeyId: string, days: number = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);

            const analytics = await this.analyticsModel.find({
                apiKeyId,
                date: { $gte: startDate }
            }).sort({ date: 1 }).lean();

            return analytics.map(record => ({
                date: record.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                totalCalls: record.totalCalls,
                successfulCalls: record.successfulCalls,
                failedCalls: record.failedCalls,
                rateLimitedCalls: record.rateLimitedCalls,
                successRate: record.totalCalls > 0 ? (record.successfulCalls / record.totalCalls) * 100 : 0
            }));
        } catch (error) {
            console.error('Failed to get analytics summary:', error);
            return [];
        }
    }

    /**
     * Get overall analytics for a user (across all their API keys)
     */
    async getUserAnalyticsSummary(userApiKeyIds: string[], days: number = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);

            const analytics = await this.analyticsModel.aggregate([
                {
                    $match: {
                        apiKeyId: { $in: userApiKeyIds },
                        date: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalCalls: { $sum: "$totalCalls" },
                        successfulCalls: { $sum: "$successfulCalls" },
                        failedCalls: { $sum: "$failedCalls" },
                        rateLimitedCalls: { $sum: "$rateLimitedCalls" }
                    }
                }
            ]);

            const result = analytics[0] || {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                rateLimitedCalls: 0
            };

            // Calculate success rate
            result.successRate = result.totalCalls > 0 
                ? (result.successfulCalls / result.totalCalls) * 100 
                : 0;

            return result;
        } catch (error) {
            console.error('Failed to get user analytics summary:', error);
            return {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                rateLimitedCalls: 0,
                successRate: 0
            };
        }
    }

    /**
     * Get analytics for a user by date range
     */
    async getUserAnalyticsByDateRange(userApiKeyIds: string[], startDate: Date, endDate: Date) {
        try {
            const analytics = await this.analyticsModel.find({
                apiKeyId: { $in: userApiKeyIds },
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 }).lean();

            return analytics.map(record => ({
                date: record.date.toISOString().split('T')[0],
                apiKeyId: record.apiKeyId,
                totalCalls: record.totalCalls,
                successfulCalls: record.successfulCalls,
                failedCalls: record.failedCalls,
                rateLimitedCalls: record.rateLimitedCalls,
                successRate: record.totalCalls > 0 ? (record.successfulCalls / record.totalCalls) * 100 : 0
            }));
        } catch (error) {
            console.error('Failed to get user analytics by date range:', error);
            return [];
        }
    }

    /**
     * Clean up old analytics data (older than specified days)
     */
    async cleanupOldAnalytics(olderThanDays: number = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            cutoffDate.setHours(0, 0, 0, 0);

            const result = await this.analyticsModel.deleteMany({
                date: { $lt: cutoffDate }
            });

            console.log(`Cleaned up ${result.deletedCount} old analytics records older than ${olderThanDays} days`);
            return result.deletedCount;
        } catch (error) {
            console.error('Failed to cleanup old analytics:', error);
            return 0;
        }
    }
}
