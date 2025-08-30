import { Permission } from 'src/auth/domain/entities/permission.entity';
import { UpdatePermissionCommand } from './commands/update-permission.command';

export const UpdatePermissionPort = Symbol('UpdatePermissionPort');
export interface UpdatePermissionPort {
  execute(command: UpdatePermissionCommand): Promise<Permission>;
}
