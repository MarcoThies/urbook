import { Controller, Get, UseGuards } from "@nestjs/common";
import { ManageService } from "./manage.service";
import { BooksEntity } from "../_shared/entities/books.entity";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "../authentification/roles/roles.guard";
import { Roles } from "../authentification/roles/roles.decorator";

@Controller('manage')
export class ManageController {
  constructor(private readonly manageService: ManageService) {
  }

  @Roles('user')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('list-books')
  public async listBooks() : Promise<BooksEntity[]> {
    return await this.manageService.listBooks();
  }
}