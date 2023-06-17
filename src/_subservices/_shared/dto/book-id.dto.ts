import { IsNotEmpty, IsString } from "class-validator";

export class BookIdDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;
}