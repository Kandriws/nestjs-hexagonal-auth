import { Role } from '../../entities/role.entity';

export const FindRolesPort = Symbol('FindRolesPort');
export interface FindRolesPort {
  execute(): Promise<Role[]>;
}
