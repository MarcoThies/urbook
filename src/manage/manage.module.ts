import { Module } from '@nestjs/common';
import { ManageController } from './manage.controller';
import { ManageService } from './manage.service';
import { DataManagerModule } from "../_shared/data-manager.module";

@Module({
  imports: [DataManagerModule],
  controllers: [ManageController],
  providers: [ManageService],
})
export class ManageModule {}
