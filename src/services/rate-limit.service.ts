import { Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";


@Injectable()
export class RateLimitService {
    private redis: Redis;
    private readonly logger = new Logger(RateLimitService.name);

    private tokenBucketScript = `
    local key = KEYS[1]
    local maxTokens = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local tokensPerWindow = tonumber(ARGV[3])
    local now = tonumber(ARGV[4])

    local state = redis.call("HMGET, key, "tokens", "last")
    local tokens = tonumber(state[1]) or maxTokens
    local last = tonumber(state[2]) or now

    -- calculate refill
    local elapsed = math.max(0, now - last)
    local refill = (elapsed / window) * tokensPerWindow
    tokens = math.min(maxTokens, tokens + refill)
    if tokens < 1 then
        -- not allowed
        redis.call("HMSET", key, "tokens", tokens, "last", now)
        redis.call("EXPIRE", key, math.ceil(window * 2))
        return {0, tokens}
    else
        tokens = tokens - 1
        redis.call("HMSET", key, "tokens", tokens, "last", now)
        redis.call("EXPIRE", key, math.ceil(window * 2))
        return {1, tokens}
    end
    `;

    private tokensBucketSha: string | null = null;

    constructor() {
        this.redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
        this.redis.script("LOAD", this.tokenBucketScript).then((sha: any) => (this.tokensBucketSha = sha)).catch(e => {
            this.logger.warn('Failed to load lua script: ' + e.message);
        })
    }

    async consume(keyId: string, limit: number, windowSeconds: number) {
        const now = Math.floor(Date.now() / 1000);
        // tokensPerWindow = limit -- we refill limit every windowSeconds
        // maxTokens = limit (allow burst up to limit)
        try {
            if (!this.tokensBucketSha) {
                // fallback: eval directly
                const res: any = await this.redis.eval(this.tokenBucketScript, 1, `rate:${keyId}`, limit, windowSeconds, limit, now);
                return { allowed: res[0] === 1, remaining: parseFloat(res[1]) };
            }
            const res: any = await this.redis.evalsha(this.tokensBucketSha, 1, `rate:${keyId}`, limit, windowSeconds, limit, now);
            return { allowed: res[0] === 1, remaining: parseFloat(res[1]) };
        } catch (err) {
            // On redis error: fail-open or fail-closed? choose fail-open for availability
            this.logger.warn(`Redis error in rate limiter (${err.message}). Fail-open.`);
            return { allowed: true, remaining: Number.MAX_SAFE_INTEGER};
        }
    }

    async getRemaining(keyId: string) {
        const state = await this.redis.hgetall(`rate:${keyId}`);
        return state;
    }
}