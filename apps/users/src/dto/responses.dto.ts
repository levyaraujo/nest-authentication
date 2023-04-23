import { Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class SuccessResponseDto {
  @IsString()
  message: string;

  @IsNumber()
  status: number;
}
