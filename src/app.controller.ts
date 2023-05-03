import { Controller, Get } from '@nestjs/common';
import { AppService, statusObj } from "./app.service";

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  status(): statusObj {
    return this.appService.requestStatus();
  }

}
