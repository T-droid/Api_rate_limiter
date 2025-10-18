import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { AuthController } from './auth/auth.contoller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { KeysModule } from './keys/keys.module';

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
    KeysModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
