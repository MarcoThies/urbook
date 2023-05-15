import { Injectable } from '@nestjs/common';
import { PdfGeneratorSubservice } from "../_subservices/pdf-generator.subservice";

@Injectable()
export class GenerateService {

  async generatePdf(): Promise<boolean> {
    let generator = new PdfGeneratorSubservice();
    return await generator.createA5Book(7);
  }

}
