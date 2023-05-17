import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../_shared/entities/books.entity';
import { ParameterEntity } from './entities/parameter.entity';
import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";


@Module({
  imports: [TypeOrmModule.forFeature([BooksEntity, ParameterEntity])],
  controllers: [GenerateController],
  providers: [GenerateService, BookGeneratorSubservice],
  exports: [GenerateService],
})
export class GenerateModule {}
