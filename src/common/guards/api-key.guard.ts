import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { KeysService } from "src/keys/keys.service";
import { RateLimiterService } from "src/rate-limiter/rate-limiter.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {

    constructor(private readonly keyService: KeysService, private readonly rateLimiterService: RateLimiterService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) throw new UnauthorizedException('API key missing');

        try {
            const user = await this.keyService.validateKey(apiKey);
            request.user = user;

            const allowed = await this.rateLimiterService.consume(apiKey);
            if (!allowed) throw new UnauthorizedException("Rate limit exceeded");

            return true;
        } catch (error) {
            throw new UnauthorizedException(error.message || 'Access denied');
        }
    }
}