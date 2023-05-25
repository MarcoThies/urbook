import { Module } from '@nestjs/common';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { DataManagerModule } from 'src/_shared/data-manager.module';
import { DatabaseLoggerModule } from "../_shared/database-logger.module";

@Module({
  imports: [
    DataManagerModule,
    DatabaseLoggerModule,
    TypeOrmModule.forFeature([ApiKeyEntity])
  ],
  providers: [AdministrationService],
  controllers: [AdministrationController],
})
export class AdministrationModule {}