import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { IdDto } from './dto/id.dto';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { IncomingUserDto, UserDto } from './dto/user.dto';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import { createReadStream } from 'fs';
import { IMAGE_FOLDER } from './constants/paths';
import * as fs from 'fs';
import { ImageService } from '@app/common';
import { EMAIL_SERVICE } from './constants/services';
import { ClientProxy } from '@nestjs/microservices';
import { SuccessResponseDto } from './dto/success-response.dto';
import { rmqDto } from './dto/rabbitmq-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly imageService: ImageService,
    private readonly httpService: HttpService,
    private readonly usersRepository: UsersRepository,
    @Inject(EMAIL_SERVICE) private emailClient: ClientProxy,
  ) {}

  async createUser(
    incomingUserDto: IncomingUserDto,
    avatar: Express.Multer.File,
  ): Promise<SuccessResponseDto> {
    await this.checkUserExists(incomingUserDto.email);
    try {
      const userDto = await this.createUserDto(incomingUserDto, avatar);
      await this.usersRepository.create(userDto);
      const email = incomingUserDto.email;
      const firstName = incomingUserDto.firstName;
      const message: rmqDto = {
        userEmail: email,
        firstName: firstName,
      };
      await lastValueFrom(this.emailClient.emit('user-created', message));
      console.log('RabbitMQ message sent');

      return {
        message: 'User created successfully',
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async checkUserExists(email: string): Promise<void> {
    const user = await this.usersRepository.userExists({ email: email });
    if (user) {
      throw new HttpException(
        {
          message: 'This email is already associated with an account.',
          status: HttpStatus.CONFLICT,
        },
        HttpStatus.CONFLICT,
      );
    } else {
    }
  }

  async createUserDto(
    incomingUserDto: IncomingUserDto,
    avatar: Express.Multer.File,
  ): Promise<UserDto> {
    const { base64, filename } = this.imageService.downloadImage(avatar);
    return {
      firstName: incomingUserDto.firstName,
      lastName: incomingUserDto.lastName,
      email: incomingUserDto.email,
      avatar: base64,
      avatarFileName: filename,
    };
  }

  async findUserByEmail(email: User['email']): Promise<User | null> {
    return await this.usersRepository.findOne({ email });
  }

  async getUser(id: string): Promise<void | any> {
    try {
      const apiURL = String(process.env.API_URL);
      const { data } = await firstValueFrom(
        this.httpService.get(`${apiURL}/${id}`),
      );
      return { ...data, status: HttpStatus.OK };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('User not found');
      } else if (error.response && error.response.status === 500) {
        throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  async getUserAvatar(id: IdDto): Promise<StreamableFile> {
    const user = await this.usersRepository.findOne({ _id: id });

    if (user === null) {
      throw new NotFoundException('User not found');
    }

    if (!user.avatar) {
      throw new NotFoundException('User avatar not found');
    }
    const imageBuffer = Buffer.from(user.avatar, 'base64');
    const file = createReadStream(imageBuffer);
    return new StreamableFile(file);
  }

  async deleteUserAvatar(id: string): Promise<SuccessResponseDto> {
    const user = await this.usersRepository.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const fileName = user.avatarFileName;
    if (!fileName) {
      throw new NotFoundException('User avatar not found');
    }

    const path = `${IMAGE_FOLDER}/${fileName}`;
    fs.unlinkSync(path);

    await this.usersRepository.findOneAndUpdate(
      { _id: id },
      { avatar: null, avatarFileName: null },
    );

    return {
      message: 'User avatar deleted successfully',
      status: HttpStatus.OK,
    };
  }
}
