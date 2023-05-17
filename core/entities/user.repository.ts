import { User } from './user.entity';

export interface IUserRepository {
  save(user: User): Promise<User | string>;
  updateEmail(user: User): void;
  findByEmail(email: string): User | undefined;
  exists(email: string): boolean;
  createSecretToken(user: User): void;
  // Add more methods as needed, such as delete, findAll, etc.
}
