import { Module, DynamicModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './authentification/auth.module';
import { CoreModule } from "./_core/core.module";
import { AdministrationModule } from './administration/administration.module';
import { AdministrationService } from "./administration/administration.service";
import { ManageModule } from './manage/manage.module';
import { GenerateModule } from './generate/generate.module';
import { DataSource } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as ormconfig from './_core/ormconfig';

@Module({
  controllers: [AppController],
  imports: [
    CoreModule,
    TypeOrmModule.forRoot(ormconfig),
    AuthModule,
    AdministrationModule,
    ManageModule,
    GenerateModule
  ],
  providers: [AppService]
})

export class AppModule {
}
