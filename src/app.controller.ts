import { Controller, Get } from '@nestjs/common';
import { AppService, statusObj } from "./app.service";
import { PdfGeneratorSubservice } from './_subservices/pdf-generator.subservice';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  status(): statusObj {
    let generator = new PdfGeneratorSubservice();
    console.log(generator.createA5Book(7));
    return this.appService.requestStatus();

  }

}
