import { IUserRepository } from 'core/entities/user.repository';
import { User } from 'core/entities/user.entity';

export class UserInMemoryRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User) {
    const userExists = this.findByEmail(user.email);
    if (!userExists) {
      this.users.push(user);
      return user;
    }
    return 'User already exists';
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  updateEmail(user: User): void {
    return user.updateEmail(user.email);
  }

  exists(email: string): boolean {
    return !!this.findByEmail(email);
  }

  createSecretToken(user: User): void {
    return user.createSecretToken(user.secretToken);
  }
}
