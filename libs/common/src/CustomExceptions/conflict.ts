import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super(
      'This email is already associated with an account.',
      HttpStatus.CONFLICT,
    );
  }
}
