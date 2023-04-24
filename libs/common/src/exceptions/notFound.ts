import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('User not found.', HttpStatus.NOT_FOUND);
  }
}

export class AvatarNotFoundException extends HttpException {
  constructor() {
    super('User avatar not found.', HttpStatus.NOT_FOUND);
  }
}
