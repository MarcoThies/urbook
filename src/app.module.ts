import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './authentification/auth.module';
import { CoreModule } from "./_core/core.module";
import { AdministrationModule } from './administration/administration.module';
import { AdministrationService } from "./administration/administration.service";
import { ApiKeyEntity } from "./_shared/entities/api-keys.entity";

@Module({
  controllers: [AppController],
  imports: [
    AuthModule,
    CoreModule,
    AdministrationModule,
    TypeOrmModule.forRoot({
      entities: [
        ApiKeyEntity
      ],
      autoLoadEntities: true,
    }),
  ],
  providers: [AppService],

})
export class AppModule {
}
