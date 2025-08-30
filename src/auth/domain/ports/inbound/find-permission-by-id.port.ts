import { Permission } from 'src/auth/domain/entities/permission.entity';

export const FindPermissionByIdPort = Symbol('FindPermissionByIdPort');
export interface FindPermissionByIdPort {
  execute(id: string): Promise<Permission>;
}
