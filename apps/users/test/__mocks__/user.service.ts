import { userStub } from '../stubs/user.stub';

export const UserService = jest.fn().mockReturnValue({
  createUser: jest.fn().mockResolvedValue(userStub().firstName),
  getUser: jest.fn().mockResolvedValue(userStub()),
  getUserAvatar: jest.fn().mockResolvedValue(userStub()),
  deleteUserAvatar: jest.fn().mockResolvedValue(userStub().avatar),
});
