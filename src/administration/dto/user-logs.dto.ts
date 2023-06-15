import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UserLogsDto {
  @IsNotEmpty()
  @IsNumber()
  readonly userId: number;

  @IsOptional()
  @IsNumber()
  readonly timeFrame?: number;
}
