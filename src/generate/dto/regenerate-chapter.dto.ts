import { IsNotEmpty, IsString, IsNumber} from "class-validator";

export class RegenerateChapterDto {
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @IsNotEmpty()
  @IsNumber()
  chapterId: number;
}