import { createMockMulterFileFromImage } from '../createMockMulterFileFromImage';
import { IncomingUserDto } from 'apps/users/src/dto/user.dto';

export const userStub = (): IncomingUserDto => {
  const filePath = `${process.cwd()}/apps/users/test/images/spiderman.jpg`;
  const file = createMockMulterFileFromImage(filePath);
  return {
    email: 'bruce.wayne@email.com',
    firstName: 'Bruce',
    lastName: 'Wayne',
    avatar: file,
  };
};
