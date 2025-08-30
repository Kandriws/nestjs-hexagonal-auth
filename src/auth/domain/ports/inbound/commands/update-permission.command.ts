import { PermissionCommand } from './permission.command';

export interface UpdatePermissionCommand extends Partial<PermissionCommand> {
  permissionId: string;
}
