import { Injectable } from '@nestjs/common';
import { CreateBookDto } from "./dto/createbook.dto";
import { BooksEntity } from 'src/_shared/entities/books.entity';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BookIdInterface } from "./interfaces/book-id.interface";
import { PdfGeneratorSubservice } from "../_subservices/pdf-generator.subservice";
import { ParameterEntity } from './entities/parameter.entity';
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";

@Injectable()
export class GenerateService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly booksRepo : Repository<BooksEntity>,
    @InjectRepository(ParameterEntity)
    private readonly parameterRepo : Repository<ParameterEntity>,
  ) {}

  public async create(createBookDto: CreateBookDto, user: ApiKeyEntity): Promise<BookIdInterface> {
    const newBookId = this.generateBookId(3,4);

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
    const newBook = await this.booksRepo.save(bookIdEntry);

    return {
        bookId: newBookId,
        status: 1,
        timeStamp: bookIdEntry.createdAt.toUTCString()
    } as BookIdInterface
  } 

  generateBookId(segments= 3, length:number = 8, delimiter:string = "-"): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let keyGroup = [] as string[];

    let keySegment
    for (let n = 0; n < segments; n++) {
      keySegment = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        keySegment += characters.charAt(randomIndex);
      }
      keyGroup.push(keySegment);
    }
    return keyGroup.join(delimiter);
  }

  //DEMO function
  async generatePdf(): Promise<boolean> {
    let generator = new PdfGeneratorSubservice();
    return await generator.createA5Book(7);
      }
}
