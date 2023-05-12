import { IsNotEmpty } from 'class-validator';

export class ApiKeyHashDto {
  @IsNotEmpty() apiHash: string;
}
