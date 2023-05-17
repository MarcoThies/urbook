import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../_shared/entities/books.entity';
import { ParameterEntity } from './entities/parameter.entity';
import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";
import { ImagePromtDesignerSubservice } from "../_subservices/image-promt-designer.subservice";
import { TextPromptDesignerSubservice } from "../_subservices/text-prompt-designer.subservice";
import { DataManagerSubservice } from "../_subservices/data-manager.subservice";

// Generate-Service Module
@Module({
  imports: [TypeOrmModule.forFeature([BooksEntity, ParameterEntity])],
  controllers: [GenerateController],
  providers: [
    GenerateService,
    DataManagerSubservice,
    BookGeneratorSubservice, ImagePromtDesignerSubservice, TextPromptDesignerSubservice
  ],
  exports: [GenerateService],
})
export class GenerateModule {}
