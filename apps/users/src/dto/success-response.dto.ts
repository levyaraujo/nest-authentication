import { IsNumber, IsString } from 'class-validator';

export class SuccessResponseDto {
  @IsString()
  message: string;

  @IsNumber()
  status: number;
}
