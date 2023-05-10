import { Module } from '@nestjs/common';
import { AdministrationService } from './administration.service';
import { AdministrationController } from './administration.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  providers: [AdministrationService],
  controllers: [AdministrationController],
})
export class AdministrationModule {}