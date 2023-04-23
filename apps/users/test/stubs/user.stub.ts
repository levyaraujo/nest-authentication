import { createMockMulterFileFromImage } from '../createMockMulterFileFromImage';
import { IncomingUserDto } from 'apps/users/src/dto/user.dto';

export const userStub = (): IncomingUserDto => {
  const filePath = `${process.cwd()}/apps/users/test/images/batman.jpg`;
  const file = createMockMulterFileFromImage(filePath);
  return {
    firstName: 'Bruce',
    lastName: 'Wayne',
    email: 'bruce.wayne@email.com',
    avatar: file,
  };
};
