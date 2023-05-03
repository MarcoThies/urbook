import { Module } from '@nestjs/common';
import { UserEntity } from "./entities/user.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from "./user.controller";

@Module({
  imports:
    [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}