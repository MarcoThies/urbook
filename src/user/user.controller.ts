import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UseGuards,
  Request,
  Session,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthService } from "../auth/auth.service";
import { UserEntity } from "./entities/user.entity";
import { UserDto } from "./dto/user.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller('user')
export class UserController {
  constructor(
    // private readonly userService: UserService
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  profile(@Request() req): UserDto {
    return req.user;
  }
}