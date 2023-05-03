import { Module, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from "./core/core.module";
import { UserEntity } from "./user/entities/user.entity";

@Module({
  controllers: [AppController],
  imports: [
    AuthModule,
    UserModule,
    CoreModule,
    TypeOrmModule.forRoot({
      entities: [
        UserEntity
      ],
      autoLoadEntities: true,
    }),
  ],
  providers: [AppService],

})
export class AppModule {
}
