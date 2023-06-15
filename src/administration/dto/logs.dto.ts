import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class LogsDto {
  @IsOptional()
  @IsNumber()
  readonly userId?: number;

  @IsOptional()
  @IsNumber()
  readonly timeFrame?: number;

  @IsOptional()
  @IsString()
  readonly isbn?: string;
}
