import { Module } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './roles/jwt.strategy';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_subservices/_shared/entities/api-keys.entity";
import { DatabaseLoggerModule } from "../_subservices/_shared/database-logger.module";

@Module({
  providers: [
    AuthService,
    JwtStrategy
  ],
  imports: [
    DatabaseLoggerModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRETKEY,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION
      },
    }),
    TypeOrmModule.forFeature([ApiKeyEntity])
  ],
  controllers: [AuthController],
  exports: [
    PassportModule,
    JwtModule
  ],
})
export class AuthModule {}
