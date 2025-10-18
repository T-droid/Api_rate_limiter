import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { KeysService } from "src/keys/keys.service";

@Injectable()
export class ApiKeyGuard implements CanActivate {

    constructor(private readonly keyService: KeysService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.header['x-api-key'];

        if (!apiKey) throw new UnauthorizedException('API key missing');

        const user = await this.keyService.validateKey(apiKey);
        request.user = user;

        return true;
    }
}