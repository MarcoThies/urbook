import { Controller, Get, UseGuards } from "@nestjs/common";
import { ManageService } from "./manage.service";
import { BooksEntity } from "../_shared/entities/books.entity";
import { AuthGuard } from "@nestjs/passport";

@Controller('manage')
export class ManageController {
  constructor(private readonly manageService: ManageService) {
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('list-books')
  public async listBooks() : Promise<BooksEntity[]> {
    return await this.manageService.listBooks();
  }
}

//   "url": "mysql://web14_7:o7K31S8RXaycvOBr@s204.goserver.host:3306/web14_db7",
