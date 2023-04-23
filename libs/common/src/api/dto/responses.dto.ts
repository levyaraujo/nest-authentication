import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsInt,
  IsNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class UserCreatedResponse {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNumber()
  id: number;

  @IsDate()
  createdAt: Date;
}

class UserDTO {
  @IsString()
  email: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsUrl()
  avatar: string;
}

class SupportDTO {
  @IsUrl()
  url: string;

  @IsString()
  text: string;
}

export class GetUserResponse {
  @ValidateNested()
  @Type(() => UserDTO)
  data: UserDTO;

  @ValidateNested()
  @Type(() => SupportDTO)
  support: SupportDTO;
}
