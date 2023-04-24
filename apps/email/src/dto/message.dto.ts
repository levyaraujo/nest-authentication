import { IsEmail, IsString } from 'class-validator';

export class incomingMessageDto {
  @IsEmail()
  userEmail: string;

  @IsString()
  firstName: string;
}
