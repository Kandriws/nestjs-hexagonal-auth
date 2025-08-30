import { Role } from '../../entities/role.entity';
import { CreateRoleCommand } from './commands/create-role.command';

export const CreateRolePort = Symbol('CreateRolePort');
export interface CreateRolePort {
  execute(command: CreateRoleCommand): Promise<Role>;
}
