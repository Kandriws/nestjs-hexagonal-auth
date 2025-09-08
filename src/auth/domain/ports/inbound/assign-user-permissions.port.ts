import { AssignUserPermissionsCommand } from './commands/assign-user-permissions.command';

export const AssignUserPermissionsPort = Symbol('AssignUserPermissionsPort');
export interface AssignUserPermissionsPort {
  execute(command: AssignUserPermissionsCommand): Promise<void>;
}
