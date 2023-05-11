import { Module } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

@Module({
  providers: [
    AuthService,
    JwtStrategy
  ],
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,

    }),
    JwtModule.register({
      secret: process.env.SECRETKEY,
      signOptions: {
        expiresIn: "10min",
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
