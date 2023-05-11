import { Module } from '@nestjs/common';
import { ManageController } from './manage.controller';
import { ManageService } from './manage.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { BooksEntity } from "../_shared/entities/books.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([BooksEntity])
  ],
  controllers: [ManageController],
  providers: [ManageService],
})
export class ManageModule {}
