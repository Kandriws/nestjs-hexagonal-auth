import { AssignUserRolesCommand } from './commands/assign-user-roles.command';

export const AssignUserRolesPort = Symbol('AssignUserRolesPort');
export interface AssignUserRolesPort {
  execute(command: AssignUserRolesCommand): Promise<void>;
}
