import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import {
  ApiService,
  DatabaseModule,
  ImageModule,
  ImageService,
  RabbitMQService,
  RmqModule,
} from '@app/common';
import * as Joi from 'joi';
import { UsersRepository } from './users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { EMAIL_SERVICE } from './constants/services';
import { HttpModule } from '@nestjs/axios';
import { AvatarRepository } from './avatar.repository';
import { Avatar, AvatarSchema } from './schemas/avatar.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: [
        `${process.cwd()}/libs/common/src/config/${process.env.NODE_ENV}.env`,
        './apps/users/.env',
      ],
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Avatar.name, schema: AvatarSchema },
    ]),
    RmqModule.register({
      name: EMAIL_SERVICE,
    }),
    ImageModule,
    HttpModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    AvatarRepository,
    ImageService,
    RabbitMQService,
    ApiService,
  ],
})
export class UsersModule {}
