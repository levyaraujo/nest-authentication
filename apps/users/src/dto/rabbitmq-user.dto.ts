import { IsEmail, IsString } from 'class-validator';

export class rmqDto {
  @IsEmail()
  userEmail: string;

  @IsString()
  firstName: string;
}
