import { Controller, Get, Render, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './common/guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getHello() {
    return { message: "Hello world"};
  }

  @Get('keys')
  @UseGuards(AuthGuard)
  @Render('api-keys')
  getApiKeysPage(@Request() req) {
    return { 
      user: req.user,
      title: 'API Keys'
    };
  }

  @Get('analytics')
  @UseGuards(AuthGuard)
  @Render('analytics')
  getAnalytics(@Request() req) {
    return { 
      user: req.user,
      title: 'Analytics'
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @Render('profile')
  getProfile(@Request() req) {
    return { 
      user: req.user,
      title: 'Profile'
    };
  }

  @Get('docs')
  @Render('documentation')
  getDocs() {
    return { title: 'API Documentation' };
  }
}
