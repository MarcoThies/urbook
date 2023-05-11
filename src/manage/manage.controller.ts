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

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('list-books')
  @Roles('user')
  public async listBooks() : Promise<BooksEntity[]> {
    return await this.manageService.listBooks();
  }
}

//   "url": "mysql://web14_7:o7K31S8RXaycvOBr@s204.goserver.host:3306/web14_db7",
