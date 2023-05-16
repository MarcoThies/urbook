import { IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty() child_name: string;
  @IsNotEmpty() child_favColor: string;
  @IsNotEmpty() child_favAnimals: string;
  @IsNotEmpty() child_age: number;
  @IsNotEmpty() child_country: string;
  @IsNotEmpty() child_language: string;
  @IsNotEmpty() child_gender: string;

  @IsNotEmpty() topic_moralType: any;
  @IsNotEmpty() topic_chapterCount: number;
  @IsNotEmpty() topic_imageStyle: any;
  @IsNotEmpty() topic_specialTopic: string;
}