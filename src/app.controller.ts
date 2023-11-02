import { Controller, Get, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('exito')
  getCookie(@Req() req: Request) {
    return this.appService.getCookie(req);
  }
}