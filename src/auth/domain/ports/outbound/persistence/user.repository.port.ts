import { User } from 'src/auth/domain/entities/user.entity';
import { Email } from 'src/shared/domain/types';

export const UserRepositoryPort = Symbol('UserRepositoryPort');
export interface UserRepositoryPort {
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
}
