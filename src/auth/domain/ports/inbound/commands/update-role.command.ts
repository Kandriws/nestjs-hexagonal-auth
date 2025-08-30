import { RoleCommand } from './role.command';

export interface UpdateRoleCommand extends Partial<RoleCommand> {
  roleId: string;
}
