import { IsNotEmpty, IsString } from "class-validator";

export class RegenerateChapterDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsNotEmpty()
  @IsString()
  chapterId: number;
}