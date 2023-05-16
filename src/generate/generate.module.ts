import { Module } from '@nestjs/common';
import { GenerateService } from './generate.service';
import { GenerateController } from './generate.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../_shared/entities/books.entity';


@Module({
  controllers: [GenerateController],
  providers: [GenerateService],
  imports: [TypeOrmModule.forFeature([BooksEntity])]
})
export class GenerateModule {}
