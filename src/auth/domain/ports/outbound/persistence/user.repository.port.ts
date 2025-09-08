import { User } from 'src/auth/domain/entities/user.entity';
import { Email, UserId } from 'src/shared/domain/types';

export const UserRepositoryPort = Symbol('UserRepositoryPort');
export interface UserRepositoryPort {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  assignRoles(
    userId: UserId,
    roleIds: string[],
    assignedById?: UserId | null,
  ): Promise<void>;
}
