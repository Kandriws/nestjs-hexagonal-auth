import { Permission } from 'src/auth/domain/entities/permission.entity';

export const PermissionRepositoryPort = Symbol('PermissionRepositoryPort');
export interface PermissionRepositoryPort {
  findById(id: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  save(permission: Permission): Promise<void>;
  delete(id: string): Promise<void>;
}
