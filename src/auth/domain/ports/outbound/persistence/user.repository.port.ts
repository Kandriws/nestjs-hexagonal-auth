import { User } from 'src/auth/domain/entities/user.entity';

export const UserRepositoryPort = Symbol('UserRepositoryPort');
export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
