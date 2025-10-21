import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { KeysModule } from './keys/keys.module';
import { RateLimiterModule } from './rate-limiter/rate-limiter.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentationModule } from './documentation/documentation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI')
      }) as any,
      inject: [ConfigService]
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        url: configService.get<string>('REDIS_URI'),
        ttl: 60 * 1000, // 60 seconds default TTL
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    KeysModule,
    RateLimiterModule,
    DashboardModule,
    DocumentationModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
