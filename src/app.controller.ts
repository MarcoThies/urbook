import { Body, Controller, Get, Post, Request} from "@nestjs/common";
import { AppService, statusObj } from "./app.service";
import { ApiKeyEntity } from "./_subservices/_shared/entities/api-keys.entity";
import { ApiKeyDto } from "./_subservices/_shared/dto/api-key.dto";
import { MJMessage } from "midjourney/src/interfaces/message";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('status')
  public status(@Request() req): statusObj {
    let currUser: ApiKeyEntity | undefined = req.user;
    console.log(currUser);
    return this.appService.requestStatus();
  }

}
