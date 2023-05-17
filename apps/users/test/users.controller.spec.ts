import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/users.controller';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { User, UserSchema } from '../src/schemas/user.schema';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { userStub } from './stubs/user.stub';
import { UsersService } from '../src/users.service';
import {
  AvatarNotFoundException,
  DatabaseModule,
  EMAIL_SERVICE,
  ImageModule,
  ImageService,
  RabbitMQService,
  RabbitMQModule,
} from '@app/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { Avatar, AvatarSchema } from '../src/schemas/avatar.schema';
import { HttpModule } from '@nestjs/axios';
import { UsersRepository } from '../src/users.repository';
import {
  deleteUserAvatarResponse,
  expectedResponse,
  expectedResponseId2,
  getUserAvatarResponse,
} from './stubs/apiResponses';
import { createResponse } from 'node-mocks-http';
import { AvatarRepository } from '../src/avatar.repository';

describe('UsersController', () => {
  let usersController: UsersController;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let avatarModel = Model<Avatar>;
  const user = userStub();

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env['MONGODB_URI'] = uri;
    process.env['PORT'] = uri.split(':')[1];
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model<User>(User.name, UserSchema);
    avatarModel = mongoConnection.model<Avatar>(Avatar.name, AvatarSchema);
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema: Joi.object({
            MONGODB_URI: Joi.string().required(),
            PORT: Joi.string().required(),
          }),
        }),
        DatabaseModule,
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Avatar.name, schema: AvatarSchema },
        ]),
        RabbitMQModule.register({
          name: EMAIL_SERVICE,
        }),
        ImageModule,
        HttpModule,
      ],
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Avatar.name), useValue: avatarModel },
        {
          provide: RabbitMQService,
          useValue: { sendRabbitMQMessage: jest.fn() },
        },
        UsersRepository,
        AvatarRepository,
        ImageService,
      ],
    }).compile();
    usersController = app.get<UsersController>(UsersController);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('createUser', () => {
    it('should return the api user object', async () => {
      const createdUser = await usersController.createUser(user, user.avatar);
      expect(createdUser.email).toBe(user.email);
    });
  });

  describe('getUser', () => {
    it('should return a user json, specified by id 1', async () => {
      const retrievedUser = await usersController.getUser('1');
      expect(retrievedUser).toEqual(expectedResponse);
    });

    it('should return a user json, specified by id 2', async () => {
      const retrievedUser = await usersController.getUser('2');
      expect(retrievedUser).toEqual(expectedResponseId2);
    });
  });

  describe('getUserAvatar', () => {
    it('should return a success response with the avatar', async () => {
      const response = createResponse();
      const createdUser = await usersController.createUser(user, user.avatar);
      const retrievedAvatar = await usersController.getUserAvatar(
        createdUser.id.toString(),
        response,
      );
      expect(retrievedAvatar).toEqual(getUserAvatarResponse);
    });

    it('should throw a AvatarNotFoundException', async () => {
      const response = createResponse();
      await expect(
        usersController.getUserAvatar('1', response),
      ).rejects.toThrow(AvatarNotFoundException);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should return a success avatar deleted response', async () => {
      const createdUser = await usersController.createUser(user, user.avatar);
      const id = createdUser.id.toString();
      const retrievedAvatar = await usersController.deleteUserAvatar(id);
      expect(retrievedAvatar).toEqual(deleteUserAvatarResponse);
    });

    it('should throw a AvatarNotFoundException', async () => {
      await expect(usersController.deleteUserAvatar('1')).rejects.toThrow(
        AvatarNotFoundException,
      );
    });
  });
});
