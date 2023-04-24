import { IsEmail } from 'class-validator';

export class sendEmailResponseDto {
  @IsEmail()
  messageId: string;
}
