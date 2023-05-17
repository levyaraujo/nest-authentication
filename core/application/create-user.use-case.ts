import { IUserRepository } from 'core/entities/user.repository';
import { User, UserProps } from 'core/entities/user.entity';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userProps: UserProps) {
    const existingUser = this.userRepository.findByEmail(userProps.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User(userProps);
    await this.userRepository.save(user);
    console.log(user);
    return user;
  }
}
