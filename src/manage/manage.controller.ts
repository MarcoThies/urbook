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
