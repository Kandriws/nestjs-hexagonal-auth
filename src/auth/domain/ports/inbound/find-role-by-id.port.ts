import { Role } from '../../entities/role.entity';

export const FindRoleByIdPort = Symbol('FindRoleByIdPort');
export interface FindRoleByIdPort {
  execute(id: string): Promise<Role>;
}
