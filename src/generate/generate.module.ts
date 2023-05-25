import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';

import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";
import { ImagePromptDesignerSubservice } from "../_subservices/image-prompt-designer.subservice";
import { TextPromptDesignerSubservice } from "../_subservices/text-prompt-designer.subservice";
import { RequestManagerSubservice } from "../_subservices/request-manager.subservice";
import { PdfGeneratorSubservice } from '../_subservices/pdf-generator.subservice';
import { DataManagerModule } from "../_shared/data-manager.module";
import { DatabaseLoggerModule } from "../_shared/database-logger.module";


// Generate-Service Module
@Module({
  imports: [DataManagerModule, DatabaseLoggerModule],
  controllers: [GenerateController],
  providers: [
    GenerateService,
    BookGeneratorSubservice,
    RequestManagerSubservice,
    ImagePromptDesignerSubservice, TextPromptDesignerSubservice,
    PdfGeneratorSubservice
  ],
  exports: [GenerateService],
})
export class GenerateModule {}
