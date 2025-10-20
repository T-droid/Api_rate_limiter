import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { CacheApiKey } from 'src/types/apiKeyCache';

@Injectable()
export class RateLimiterService {
    private bucketCapacity = 10;
    private fillRate = 1;

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    async consume(apiKey: string) {
        const key = `rateLimit:${apiKey}`;
        const cachedApiKey = await this.cacheManager.get<CacheApiKey>(key);
        if (!cachedApiKey) {
            const newBucket: CacheApiKey = {
                tokens: this.bucketCapacity - 1,
                lastFilled: Date.now()
            }
            await this.cacheManager.set(key, newBucket);
            return true;
        }

        const updatedBucket = this.refill(cachedApiKey);
        
        if (updatedBucket.tokens >= 1) {
            updatedBucket.tokens -= 1;
            await this.cacheManager.set(key, updatedBucket);
            return true;
        }

        await this.cacheManager.set(key, updatedBucket);
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
}
