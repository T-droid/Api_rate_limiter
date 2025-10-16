import { Module } from "@nestjs/common";
import { KeyModule } from "./key.module";
import { RateLimitService } from "src/services/rate-limit.service";
import { ApiKeyGuard } from "src/guards/api-key.guard";

@Module({
    imports: [KeyModule],
    providers: [RateLimitService, ApiKeyGuard],
    exports: [RateLimitService, ApiKeyGuard],
})
export class GateWayModule {};