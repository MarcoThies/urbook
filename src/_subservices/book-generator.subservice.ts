import { BooksEntity } from "../_shared/entities/books.entity";
import { DataManagerSubservice } from "./data-manager.subservice";
import { TextPromptDesignerSubservice } from "./text-prompt-designer.subservice";
import { ImagePromtDesignerSubservice } from "./image-promt-designer.subservice";
import { RequestManagerSubservice } from "./request-manager.subservice";
import { generateId } from "../_shared/utils";
import { CreateBookDto } from "../generate/dto/create-book.dto";
import { ApiKeyEntity } from "../_shared/entities/api-keys.entity";
import { ParameterEntity } from "../generate/entities/parameter.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BookGeneratorSubservice {
  constructor(
    private readonly dataManager: DataManagerSubservice,
    private readonly imagePromptDesigner: ImagePromtDesignerSubservice,
    private readonly textPromtDesigner: TextPromptDesignerSubservice,
    private readonly requestManager: RequestManagerSubservice
  ) {}

  public async generateNewBook(createBookDto: CreateBookDto, user: ApiKeyEntity) : Promise<BooksEntity>{
    // begin Book generation Prozess
    const newBookId = generateId(3,4);

    console.log(this.dataManager)

    const bookIdExists = await this.dataManager.getBookById(newBookId);
    if(bookIdExists) return await this.generateNewBook(createBookDto, user);

    // Generate new Book & Parameter entity-data-object
    const newBook = {
      isbn: newBookId,
      title: "myBook Title",
      state: 1,
      apiKeyLink: user
    } as BooksEntity;

    const newParameter = {
      childName: createBookDto.child_name
    } as ParameterEntity;

    return await this.dataManager.saveNewBook(newBook, newParameter);
  }
}