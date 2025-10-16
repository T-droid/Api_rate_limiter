import { Module, OnModuleInit, Logger } from "@nestjs/common";
import { InjectModel, MongooseModule } from "@nestjs/mongoose";
import { UsageSummary, UsageSummaryDocument, UsageSummarySchema } from "src/schema/usage-summary.schema";
import Redis from "ioredis";
import { Model } from "mongoose";

@Module({
    imports: [MongooseModule.forFeature([{ name: UsageSummary.name, schema: UsageSummarySchema }])],
})
export class UsageModule implements OnModuleInit {
    private readonly logger = new Logger(UsageModule.name);
    private redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379' );

    constructor(
        @InjectModel(UsageSummary.name) private usageModel: Model<UsageSummaryDocument>
    ) {}

    async onModuleInit() {
        // simple consumer: pop events and aggregate into usage summary
        // NOTE: This is a simple loop for example. Use a proper worker library for production.
        this.logger.log('Starting usage consumer loop');
        this.consumerLoop().catch(e => this.logger.error(e));
    }

    private async consumerLoop() {
        while (true) {
            try {
                const res = await this.redis.brpop('usage:events', 1);
                if (!res) continue;
                const payload = res[1];
                const evt = JSON.parse(payload);
                await this.aggregateEvent(evt);
            } catch (error) {
                this.logger.warn('Usage consumer error: ' + error.message);
                await new Promise(r => setTimeout(r, 500)); // brief backoff
            }
        }
    }

    private async aggregateEvent(evt: { keyId: string; ts: number }) {
        const date = new Date(evt.ts);
        const day = date.toISOString().slice(0, 10);
        const hour = date.getUTCHours();
        const q = { keyId: evt.keyId, date: day, hour };
        await this.usageModel.updateOne(q, { $inc: { requests: 1 }, $set: { lastSeen: Date.now() } }, { upsert: true })
    }
}