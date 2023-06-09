import {
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
  AvatarNotFoundException,
  ImageService,
  RabbitMQService,
  UserAlreadyExistsException,
} from '@app/common';
import { SuccessResponseDto } from './dto/responses.dto';
import { Response } from 'express';
import { AvatarRepository } from './avatar.repository';
import { Avatar } from './schemas/avatar.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    private readonly usersRepository: UsersRepository,
    private readonly avatarRepository: AvatarRepository,
    private readonly rabbitService: RabbitMQService,
  ) {}

  private logger = new Logger(UsersService.name);

  async createUser(newUser: IncomingUserDto, avatar: Express.Multer.File) {
    await this.checkUserExistsByEmail(newUser.email);
    const { firstName, lastName, email, password } = newUser;
    try {
      const avatarData = await this.imageService.saveUserAvatar(avatar);
      await this.saveUserAndAvatar(newUser, avatarData);
      await this.rabbitService.sendRabbitMQMessage(email, firstName);
      return newUser;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(err);
    }
  }

  private async saveUserAndAvatar(
    user: any,
    avatarData: { base64: string; filename: string },
  ): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    console.log(user);
    console.log(salt);
    const password = await bcrypt.hash(user.password, salt);
    const userObject = { ...user };
    await this.usersRepository.create({
      ...userObject,
      password,
    });
    await this.avatarRepository.create({ user: user.id, ...avatarData });
  }

  private async checkUserExistsByEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ email });
    if (user) {
      throw new UserAlreadyExistsException();
    }
  }

  async getAvatar(id: string): Promise<Avatar> {
    const avatar = await this.avatarRepository.findOne({ user: id });
    if (!avatar) {
      throw new AvatarNotFoundException();
    }
    return avatar;
  }

  async getUserAvatar(
    id: string,
    @Res() res: Response,
  ): Promise<SuccessResponseDto> {
    const avatar = await this.getAvatar(id);
    const imageStream = await this.imageService.createImageStream(avatar);
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
