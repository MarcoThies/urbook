import { Module } from '@nestjs/common';
import { ManageController } from './manage.controller';
import { ManageService } from './manage.service';
import { DataManagerModule } from "../_shared/data-manager.module";
import { DatabaseLoggerModule } from "../_shared/database-logger.module";

@Module({
  imports: [DataManagerModule, DatabaseLoggerModule],
  controllers: [ManageController],
  providers: [ManageService],
})
export class ManageModule {}
