import {
  Header,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Res,
} from '@nestjs/common';
import { IncomingUserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { IMAGE_FOLDER } from './constants/paths';
import * as fs from 'fs';
import {
  ApiService,
  AvatarNotFoundException,
  GetUserResponse,
  ImageService,
  RabbitMQService,
  UserAlreadyExistsException,
  UserCreatedDTO,
} from '@app/common';
import { SuccessResponseDto } from './dto/responses.dto';
import { Response } from 'express';
import { AvatarRepository } from './avatar.repository';
import { Readable } from 'stream';

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    private readonly usersRepository: UsersRepository,
    private readonly avatarRepository: AvatarRepository,
    private readonly apiService: ApiService,
    private readonly rabbitService: RabbitMQService,
  ) {}

  private logger = new Logger(UsersService.name);

  async createUser(
    newUser: IncomingUserDto,
    avatar: Express.Multer.File,
  ): Promise<UserCreatedDTO> {
    await this.checkUserExistsByEmail(newUser.email);
    const { firstName, lastName, email } = newUser;
    const userResponse: UserCreatedDTO = await this.apiService.post({
      firstName,
      lastName,
      email,
    });
    try {
      const avatarData = await this.imageService.saveUserAvatar(avatar);
      await this.saveUserAndAvatar(userResponse, avatarData);
      await this.rabbitService.sendRabbitMQMessage(email, firstName);
      return userResponse;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(err);
    }
  }

  private async saveUserAndAvatar(
    user: UserCreatedDTO,
    avatarData: { base64: string; filename: string },
  ): Promise<void> {
    const userObject = { ...user };
    await this.usersRepository.create(userObject);
    await this.avatarRepository.create({ user: user.id, ...avatarData });
  }

  private async checkUserExistsByEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      throw new UserAlreadyExistsException();
    }
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
    const avatar = await this.avatarRepository.findOne({ user: id });

    if (!avatar) {
      throw new AvatarNotFoundException();
    }

    const base64Image = avatar.base64;
    const imageStream = new Readable({
      read() {
        this.push(Buffer.from(base64Image, 'base64'));
        this.push(null);
      },
    });

    imageStream.pipe(res);

    return {
      message: 'User avatar retrieved successfully',
      status: HttpStatus.OK,
    };
  }

  async deleteUserAvatar(id: string): Promise<SuccessResponseDto> {
    const avatar = await this.avatarRepository.findOne({ user: id });

    if (!avatar) {
      throw new AvatarNotFoundException();
    }

    const path = `${IMAGE_FOLDER}/${avatar.filename}`;
    fs.unlinkSync(path);

    await this.avatarRepository.deleteOne({ user: id });

    return {
      message: 'User avatar deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
