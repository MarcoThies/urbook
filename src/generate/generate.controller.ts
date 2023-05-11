import { Controller, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../authentification/roles/roles.guard";
import { Roles } from "../authentification/roles/roles.decorator";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('user','admin')
@Controller('generate')
export class GenerateController {}
