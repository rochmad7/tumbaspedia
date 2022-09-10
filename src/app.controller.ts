import { Controller, Get, Param, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('reset-password/:token')
  @Render('change-password')
  root(@Param('token') token: string) {
    const url = `${process.env.APP_URL}/auth/reset-password/${token}`;

    return { url };
  }
}
