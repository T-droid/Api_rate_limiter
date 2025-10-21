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



  @Get('profile')
  @UseGuards(AuthGuard)
  @Render('profile')
  getProfilePage(@Request() req) {
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
