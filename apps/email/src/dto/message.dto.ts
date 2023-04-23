import { IsEmail, IsString } from 'class-validator';

export class rmqMessageDto {
  @IsEmail()
  userEmail: string;

  @IsString()
  firstName: string;
}
