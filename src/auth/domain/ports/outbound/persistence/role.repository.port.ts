import { Role } from 'src/auth/domain/entities/role.entity';

export const RoleRepositoryPort = Symbol('RoleRepositoryPort');
export interface RoleRepositoryPort {
  findById(id: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
}
