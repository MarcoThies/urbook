import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';

import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";
import { ImagePromtDesignerSubservice } from "../_subservices/image-promt-designer.subservice";
import { TextPromptDesignerSubservice } from "../_subservices/text-prompt-designer.subservice";
import { RequestManagerSubservice } from "../_subservices/request-manager.subservice";
import { PdfGeneratorSubservice } from '../_subservices/pdf-generator.subservice';
import { DataManagerModule } from "../_shared/data-manager.module";


// Generate-Service Module
@Module({
  imports: [DataManagerModule],
  controllers: [GenerateController],
  providers: [
    GenerateService,
    BookGeneratorSubservice,
    RequestManagerSubservice,
    ImagePromtDesignerSubservice, TextPromptDesignerSubservice,
    PdfGeneratorSubservice
  ],
  exports: [GenerateService],
})
export class GenerateModule {}
