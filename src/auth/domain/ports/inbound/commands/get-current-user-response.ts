import { User } from 'src/auth/domain/entities';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { Role } from 'src/auth/domain/entities/role.entity';

export interface GetCurrentUserResponse {
  user: User;
  roles: Role[];
  permissions: Permission[];
}
