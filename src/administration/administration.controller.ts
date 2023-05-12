import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdministrationService } from "./administration.service";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";

@Controller('admin')
export class AdministrationController {
  constructor(private readonly adminService: AdministrationService ) {}

  @UseGuards(
    AuthGuard('jwt'),
    UserTypeGuard('admin')
  )
  @Get('create-key')
  async createKey(): Promise<any> {
    return await this.adminService.createKey();
  }
}