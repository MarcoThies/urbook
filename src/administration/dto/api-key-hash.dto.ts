import { IsNotEmpty } from 'class-validator';

export class ApiKeyDto {
  @IsNotEmpty() apiKey: string;
}
