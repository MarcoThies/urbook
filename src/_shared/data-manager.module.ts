// Generate-Service Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataManagerSubservice } from "../_subservices/data-manager.subservice";
import { BooksEntity } from "./entities/books.entity";
import { ParameterEntity } from "../generate/entities/parameter.entity";

@Module({
    imports: [ TypeOrmModule.forFeature([BooksEntity, ParameterEntity]) ],
    providers: [ DataManagerSubservice ],
    exports: [ DataManagerSubservice ],
})
export class DataManagerModule {}
