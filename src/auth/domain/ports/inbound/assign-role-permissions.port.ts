import { AssignRolePermissionsCommand } from './commands/assign-role-permissions.command';

export const AssignRolePermissionsPort = Symbol('AssignRolePermissionsPort');
export interface AssignRolePermissionsPort {
  execute(command: AssignRolePermissionsCommand): Promise<void>;
}
