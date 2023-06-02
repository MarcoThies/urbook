import { Controller, Get, Request, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AppService, statusObj } from "./app.service";
import { request } from "express";
import { ApiKeyEntity } from "./_subservices/_shared/entities/api-keys.entity";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "./authentification/roles/type.guard";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  status(@Request() req): statusObj {
    let currUser: ApiKeyEntity | undefined = req.user;
    console.log(currUser);
    return this.appService.requestStatus();
  }

}
