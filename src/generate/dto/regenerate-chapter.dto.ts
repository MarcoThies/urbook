import { IsNotEmpty } from 'class-validator';

export class RegenerateChapterDto {
  @IsNotEmpty() bookId: string;
  @IsNotEmpty() chapterId: number;
}