import { Module, DynamicModule } from '@nestjs/common';
import * as ormconfig from './_core/ormconfig';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './authentification/auth.module';
import { CoreModule } from "./_core/core.module";
import { AdministrationModule } from './administration/administration.module';
import { ManageModule } from './manage/manage.module';
import { GenerateModule } from './generate/generate.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataManagerModule } from "./_shared/data-manager.module";
import { DatabaseLoggerModule } from "./_shared/database-logger.module";

@Module({
  providers: [
    AppService
  ],
  imports: [
    AuthModule,
    CoreModule,
    TypeOrmModule.forRoot(ormconfig),
    AdministrationModule,
    ManageModule,
    GenerateModule,
    DataManagerModule,
    DatabaseLoggerModule
  ],
  controllers: [AppController],
})

export class AppModule {
}
