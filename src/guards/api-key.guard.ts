import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, HttpException } from "@nestjs/common";
import { KeyService } from "src/services/key.service";
import { RateLimitService } from "src/services/rate-limit.service";


@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private readonly keyService: KeyService, private readonly rateLimitService: RateLimitService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        // accept Authorisation: ApiKey <composite> OR x-api-key: <composite>
        const auth = req.get('authorization') || req.get('x-api-key');
        if (!auth) throw new UnauthorizedException('Api key missing');

        let composite: string = auth;
        if (composite.startsWith('ApiKey ')) composite = composite.slice('ApiKey '.length);
        // composite is keyId.secret OR we may accept token only; accept both
        const keyId = composite.split('.')[0];

        const dbKey = await this.keyService.findByKeyId(keyId);
        if (!dbKey || dbKey.status !== 'active') throw new UnauthorizedException('Invalid or revoked Api key');

        const valid = await this.keyService.verifySecret(composite, dbKey);
        if (!valid) throw new UnauthorizedException('Invalid API key secret');

        // rate limit
        const rateLimit = dbKey.rateLimit || { limit: Number(process.env.DEFAULT_RATE_LIMIT || 100), windowSeconds: Number(process.env.DEFAULT_RATE_WINDOW_SECONDS || 60) };
        const rl = await this.rateLimitService.consume(dbKey.keyId, rateLimit.limit, rateLimit.windowSeconds);

        if (!rl.allowed) {
            const retryAfter = rateLimit.windowSeconds;
            req.res.setHeader('Retry-After', String(retryAfter));
            throw new HttpException('Rate limit exceeded', 429)
        }

        req.apiKey = { keyId: dbKey.keyId, ownerId: dbKey.ownerId, scopes: dbKey.scopes, rate: rateLimit, remaining: rl.remaining };
        
        // async: push usage event to queue/stream (example: push to redis list)
        try {
            const redis = (this.rateLimitService as any).redis;
            if (redis) {
                const evt = JSON.stringify({ keyId: dbKey.keyId, ts: Date.now(), path: req.path, method: req.method, ip: req.ip });
                redis.lpush('usage:events', evt).catch(() => {});
            }
        } catch(e) {}

        return true;
    }
}