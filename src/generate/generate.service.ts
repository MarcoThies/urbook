// Common
import { Injectable } from '@nestjs/common';
import { generateId } from "../_shared/utils";
// Interface & DTO
import { CreateBookDto } from "./dto/createbook.dto";
import { BookIdInterface } from "./interfaces/book-id.interface";
// db repository
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// db typeorm entities
import { BooksEntity } from '../_shared/entities/books.entity';
import { ParameterEntity } from './entities/parameter.entity';
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
// Sub-Services
import { PdfGeneratorSubservice } from "../_subservices/pdf-generator.subservice";
import { BookGeneratorSubservice } from "../_subservices/book-generator.subservice";

@Injectable()
export class GenerateService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ParameterEntity)
    private readonly parameterRepo : Repository<ParameterEntity>,

    private readonly bookGenSubservice : BookGeneratorSubservice
  ) {}

  public async create(createBookDto: CreateBookDto, user: ApiKeyEntity): Promise<BookIdInterface> {
    const newBookId = generateId(3,4);

    const bookIdExists = await this.booksRepo.findOne({ where: { isbn: newBookId }});
    if(bookIdExists) return await this.create(createBookDto, user);

    const parameterEntry = await this.parameterRepo.create({
      childName: createBookDto.child_name
    });

    const bookIdEntry = await this.booksRepo.create({
      isbn: newBookId,
      title: "myBook Title",
      state: 1,
      parameterLink: parameterEntry,
      apiKeyLink: user
    });
    const newBook : BooksEntity = await this.booksRepo.save(bookIdEntry);

    // now start the generation process
    this.bookGenSubservice.generateNewBook(newBook);

    return {
        bookId: newBookId,
        status: 1,
        timeStamp: bookIdEntry.createdAt.toUTCString()
    } as BookIdInterface
  } 


  //DEMO function
  async generatePdf(): Promise<boolean> {
    let generator = new PdfGeneratorSubservice();
    return await generator.createA5Book(7);
      }
}
