import { Permission } from 'src/auth/domain/entities/permission.entity';
import { PermissionCommand } from './commands/permission.command';

export const CreatePermissionPort = Symbol('CreatePermissionPort');
export interface CreatePermissionPort {
  execute(command: PermissionCommand): Promise<Permission>;
}
