import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Res,
} from '@nestjs/common';
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
} from '@app/common';
import { SuccessResponseDto } from './dto/responses.dto';
import { Response } from 'express';
import { AvatarRepository } from './avatar.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    private readonly usersRepository: UsersRepository,
    private readonly avatarRepository: AvatarRepository,
    private readonly apiService: ApiService,
    private rabbitService: RabbitMQService,
  ) {}

  async createUser(
    incomingUserDto: IncomingUserDto,
    avatar: Express.Multer.File,
  ): Promise<UserCreatedResponse> {
    await this.checkUserExistsByEmail(incomingUserDto.email);
    try {
      const apiResponse = await this.createUserApi(incomingUserDto);
      const user = await this.usersRepository.create(apiResponse);
      const createdAvatar = await this.imageService.createUserAvatar(
        avatar,
        user,
      );
      await this.avatarRepository.create(createdAvatar);
      const { email, firstName } = incomingUserDto;
      await this.rabbitService.sendRabbitMQMessage(email, firstName);
      return apiResponse;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException({
        message: `Internal server error ${error}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async createUserApi(user: IncomingUserDto): Promise<UserCreatedResponse> {
    return this.apiService.create(user);
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
    console.log(await data);
    if (data) {
      return data;
    }
  }

  async getUserAvatar(id: string, @Res() res: Response): Promise<void> {
    const avatar = await this.avatarRepository.findOne({ user: id });

    if (!avatar) {
      throw new AvatarNotFound();
    }

    const imageBuffer = Buffer.from(avatar.base64, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  }

  async deleteUserAvatar(id: string): Promise<SuccessResponseDto> {
    const avatar = await this.avatarRepository.findOne({ user: id });
    if (!avatar) {
      throw new AvatarNotFound();
    }

    const fileName = avatar.filename;
    const path = `${IMAGE_FOLDER}/${fileName}`;
    fs.unlinkSync(path);

    await this.avatarRepository.deleteOne({ user: id });

    return {
      message: 'User avatar deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
