import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../_shared/entities/books.entity';
import { ParameterEntity } from './entities/parameter.entity';


@Module({
  controllers: [GenerateController],
  providers: [GenerateService],
  exports: [GenerateService],
  imports: [TypeOrmModule.forFeature([BooksEntity, ParameterEntity])]
})
export class GenerateModule {}
