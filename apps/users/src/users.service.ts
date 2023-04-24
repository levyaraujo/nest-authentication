import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  Res,
} from '@nestjs/common';
import { IncomingUserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
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

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    private readonly usersRepository: UsersRepository,
    private readonly apiService: ApiService,
    private readonly rabbitService: RabbitMQService,
    private readonly avatarRepository: AvatarRepository,
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
      const avatarData = await this.saveUserAvatar(avatar);
      await this.usersRepository.create({ ...userResponse });
      await this.avatarRepository.create({
        user: userResponse.id,
        ...avatarData,
      });
      await this.rabbitService.sendRabbitMQMessage(email, firstName);
      return userResponse;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException();
    }
  }

  private async saveUserAvatar(
    avatar: Express.Multer.File,
  ): Promise<{ base64: string; filename: string }> {
    const { base64, filename } = await this.imageService.saveUserAvatar(avatar);
    return { base64, filename };
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
    const avatar = await this.avatarRepository.findOne({ user: id });

    if (!avatar) {
      throw new AvatarNotFoundException();
    }
    const base64Image = avatar.base64;

    const imageBuffer = Buffer.from(base64Image, 'base64');
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);

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
