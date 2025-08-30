import { Role } from '../../entities/role.entity';
import { RoleCommand } from './commands/role.command';

export const CreateRolePort = Symbol('CreateRolePort');
export interface CreateRolePort {
  execute(command: RoleCommand): Promise<Role>;
}
