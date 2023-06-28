import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Request,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  Body,
  Post
} from "@nestjs/common";
import { ManageService } from "./manage.service";
import { BooksEntity } from "../_subservices/_shared/entities/books.entity";
import { AuthGuard } from "@nestjs/passport";
import { UserTypeGuard } from "../authentification/roles/type.guard";
import { BookIdDto } from "../_subservices/_shared/dto/book-id.dto";
import { IDeletedBook } from "./interfaces/delete-book.interface";
import { IBookInfo } from "../administration/interface/user-data.interface";

@UseGuards(
  AuthGuard('jwt'),
  UserTypeGuard('admin', 'user')
)
@Controller('manage')
export class ManageController {
  constructor(private readonly manageService: ManageService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('list-books')
  public async listBooks(@Request() req) : Promise<IBookInfo[]> {
    return await this.manageService.listBooks(req.user);
  }

  @Post('delete-book')
  public async deleteBook(@Body() bookIdDto: BookIdDto, @Request() req): Promise<IDeletedBook> {
    return await this.manageService.deleteBook(req.user, bookIdDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('book')
  public async getBook(@Body() bookIdDto: BookIdDto, @Request() req): Promise<BooksEntity> {
    return await this.manageService.getBook(req.user, bookIdDto);
  }

  @Post('pdf')
  public async getPdf(@Body() bookIdDto: BookIdDto, @Request() req): Promise<BooksEntity> {
    return await this.manageService.getPdf(req.user, bookIdDto);
  }
}
