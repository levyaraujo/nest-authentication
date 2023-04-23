import { HttpStatus, Injectable, Logger, Res } from '@nestjs/common';
import { IncomingUserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import { IMAGE_FOLDER } from './constants/paths';
import * as fs from 'fs';
import {
  ApiService,
  AvatarNotFound,
  GetUserResponse,
  ImageService,
  RabbitMQService,
  UserAlreadyExistsException,
  UserCreatedResponse,
  UserNotFoundException,
} from '@app/common';
import { SuccessResponseDto } from './dto/responses.dto';
import { Response } from 'express';

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    private readonly usersRepository: UsersRepository,
    private readonly apiService: ApiService,
    private readonly rabbitService: RabbitMQService,
  ) {}

  private logger = new Logger(UsersService.name);

  async createUser(
    incomingUserDto: IncomingUserDto,
    avatar: Express.Multer.File,
  ): Promise<UserCreatedResponse> {
    await this.checkUserExistsByEmail(incomingUserDto.email);
    const { firstName, lastName, email } = incomingUserDto;
    const apiResponse = await this.apiService.create({
      firstName,
      lastName,
      email,
    });
    this.logger.log(apiResponse);
    const { base64, filename } = await this.imageService.saveUserAvatar(avatar);
    const userObject = {
      ...apiResponse,
      avatarBase64: base64,
      avatarFileName: filename,
    };
    await this.usersRepository.create(userObject);
    await this.rabbitService.sendRabbitMQMessage(email, firstName);
    return apiResponse;
  }

  async checkUserExistsByEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      throw new UserAlreadyExistsException();
    }
  }

  async findUserByEmail(email: User['email']): Promise<User | null> {
    return await this.usersRepository.findOne({ email });
  }

  async getUser(id: string): Promise<GetUserResponse> {
    const data = this.apiService.get(id);
    if (data) {
      return data;
    }
  }

  async getUserAvatar(
    id: string,
    @Res() res: Response,
  ): Promise<SuccessResponseDto> {
    const user = await this.usersRepository.findOne({ id: id });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.avatarBase64) {
      throw new AvatarNotFound();
    }
    const base64Image = user.avatarBase64;

    const imageBuffer = Buffer.from(base64Image, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);

    return {
      message: 'User avatar retrieved successfully',
      status: HttpStatus.OK,
    };
  }

  async deleteUserAvatar(id: string): Promise<SuccessResponseDto> {
    const user = await this.usersRepository.findOne({ id: id });

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!user.avatarBase64) {
      throw new AvatarNotFound();
    }

    const path = `${IMAGE_FOLDER}/${user.avatarFileName}`;
    fs.unlinkSync(path);

    await this.usersRepository.findOneAndUpdate(
      { id: id },
      { avatarFilename: null, avatarBase64: null },
    );

    return {
      message: 'User avatar deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
