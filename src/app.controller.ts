import { Controller, Get } from '@nestjs/common';
import { AppService, statusObj } from "./app.service";
import { PdfGeneratorSubservice } from './_subservices/pdf-generator.subservice';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  status(): statusObj {

    return this.appService.requestStatus();

  }

}
