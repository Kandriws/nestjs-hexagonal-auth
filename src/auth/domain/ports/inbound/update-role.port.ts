import { Role } from '../../entities/role.entity';
import { UpdateRoleCommand } from './commands/update-role.command';

export const UpdateRolePort = Symbol('UpdateRolePort');
export interface UpdateRolePort {
  execute(command: UpdateRoleCommand): Promise<Role>;
}
