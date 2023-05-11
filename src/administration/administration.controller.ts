import { Controller, Get, UseGuards } from "@nestjs/common";
import { AdministrationService } from "./administration.service";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../authentification/roles/roles.guard";
import { Roles } from "../authentification/roles/roles.decorator";

@Controller('admin')
export class AdministrationController {
  constructor(private readonly adminService: AdministrationService ) {}

  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles('admin')
  @Get('create-key')
  async createKey(): Promise<any> {
    return await this.adminService.createKey();
  }
}