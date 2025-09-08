import { User } from 'src/auth/domain/entities/user.entity';

export const FindUsersPort = Symbol('FindUsersPort');
export interface FindUsersPort {
  execute(): Promise<User[]>;
}
