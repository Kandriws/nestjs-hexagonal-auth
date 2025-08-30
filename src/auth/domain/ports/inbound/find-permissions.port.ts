import { Permission } from 'src/auth/domain/entities/permission.entity';

export const FindPermissionsPort = Symbol('FindPermissionsPort');
export interface FindPermissionsPort {
  execute(): Promise<Permission[]>;
}
