import { Role } from 'src/auth/domain/entities/role.entity';
import { UserId } from 'src/shared/domain/types';

export const RoleRepositoryPort = Symbol('RoleRepositoryPort');
export interface RoleRepositoryPort {
  findById(id: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  findByUserId(userId: UserId): Promise<Role[]>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
  assignPermissions(roleId: string, permissionIds: string[]): Promise<void>;
}
