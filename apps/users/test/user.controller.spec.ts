jest.mock('../src/users.service');

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/users.controller';
import { UsersService } from '../src/users.service';
import { userStub } from './stubs/user.stub';
import { createMockMulterFileFromImage } from './createMockMulterFileFromImage';

describe('UsersController', () => {
  let userService: UsersService;
  let usersController: UsersController;
  const user = userStub();

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    userService = moduleRef.get<UsersService>(UsersService);
    usersController = moduleRef.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should call userService.create', async () => {
      const filePath = `${process.cwd()}/apps/users/test/images/spiderman.jpg`;
      const file = createMockMulterFileFromImage(filePath);
      await usersController.createUser(user, file);
      expect(userService.createUser).toBeCalledWith(user, file);
      expect(userService.createUser).toBeCalledTimes(1);
    });

    it('should return expectedResult', async () => {
      const expectedResult = {
        firstName: 'Spider',
        lastName: 'Man',
        email: 'spider.man@marvel.com',
        id: 977,
        createdAt: new Date('2023-04-22T21:44:28.557Z'),
      };
      jest.spyOn(userService, 'createUser').mockResolvedValue(expectedResult);
      const filePath = `${process.cwd()}/apps/users/test/images/spiderman.jpg`;
      const file = createMockMulterFileFromImage(filePath);
      const result = await usersController.createUser(user, file);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUser', () => {
    it('should call userService.getUser', async () => {
      const id = '1';
      await usersController.getUser(id);
      expect(userService.getUser).toBeCalledWith(id);
    });

    it('should return response object', async () => {
      const id = '1';
      const response = {
        data: {
          id: 1,
          email: 'george.bluth@reqres.in',
          first_name: 'George',
          last_name: 'Bluth',
          avatar: 'https://reqres.in/img/faces/1-image.jpg',
        },
        support: {
          url: 'https://reqres.in/#support-heading',
          text: 'To keep ReqRes free, contributions towards server costs are appreciated!',
        },
      };
      jest.spyOn(userService, 'getUser').mockResolvedValue(response);

      const result = await usersController.getUser(id);
      expect(result).toEqual(response);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should call userService.deleteUserAvatar', async () => {
      const id = '1';
      await usersController.deleteUserAvatar(id);
      expect(userService.deleteUserAvatar).toBeCalledWith(id);
    });

    it('should return user not found', async () => {
      const id = '251';
      const response = {
        message: 'User not found',
        status: 404,
      };
      jest.spyOn(userService, 'deleteUserAvatar').mockResolvedValue(response);

      const result = await usersController.deleteUserAvatar(id);
      expect(result).toEqual(response);
    });

    it('should return user avatar deleted', async () => {
      const id = '1';
      const response = {
        message: 'User avatar deleted successfully',
        status: 200,
      };
      jest.spyOn(userService, 'deleteUserAvatar').mockResolvedValue(response);

      const result = await usersController.deleteUserAvatar(id);
      expect(result).toEqual(response);
    });
  });
});
