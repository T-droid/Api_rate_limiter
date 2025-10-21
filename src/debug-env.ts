import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function checkEnvironment() {
  console.log('=== Environment Variables Debug ===');
  
  // Check environment variables directly
  console.log('Direct env vars:');
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log('MONGO_URI:', process.env.MONGO_URI);
  console.log('REDIS_HOST:', process.env.REDIS_HOST);
  console.log('REDIS_PORT:', process.env.REDIS_PORT);
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***SET***' : 'NOT SET');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Check via ConfigService
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    
    console.log('\nVia ConfigService:');
    console.log('MONGODB_URI:', configService.get('MONGODB_URI'));
    console.log('MONGO_URI:', configService.get('MONGO_URI'));
    console.log('REDIS_HOST:', configService.get('REDIS_HOST'));
    console.log('REDIS_PORT:', configService.get('REDIS_PORT'));
    console.log('JWT_SECRET:', configService.get('JWT_SECRET') ? '***SET***' : 'NOT SET');
    console.log('NODE_ENV:', configService.get('NODE_ENV'));
    
    await app.close();
  } catch (error) {
    console.error('Error creating app:', error.message);
  }
}

checkEnvironment().catch(console.error);
