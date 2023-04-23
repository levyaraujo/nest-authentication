import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class IncomingUserDto {
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  avatar: Express.Multer.File;
}
