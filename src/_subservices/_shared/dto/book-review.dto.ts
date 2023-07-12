import { IsNotEmpty, IsString } from "class-validator";

export class BookReviewDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsNotEmpty()
  @IsString()
  review: string;
}