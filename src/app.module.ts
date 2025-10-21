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
      isGlobal: true,
      envFilePath: ['.env.docker', '.env.production', '.env']
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || configService.get<string>('MONGO_URI')
      }) as any,
      inject: [ConfigService]
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig: any = {
          store: redisStore,
          ttl: 60 * 1000, // 60 seconds default TTL
        };

        // Check if REDIS_URI is provided (for backward compatibility)
        const redisUri = configService.get<string>('REDIS_URI');
        if (redisUri) {
          redisConfig.url = redisUri;
        } else {
          // Use individual Redis configuration for production
          const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
          const redisPort = configService.get<number>('REDIS_PORT', 6379);
          const redisPassword = configService.get<string>('REDIS_PASSWORD');
          
          redisConfig.socket = {
            host: redisHost,
            port: redisPort,
          };
          
          if (redisPassword) {
            redisConfig.password = redisPassword;
          }
        }

        return redisConfig;
      },
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
