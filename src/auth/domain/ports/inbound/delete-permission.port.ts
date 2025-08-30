export const DeletePermissionPort = Symbol('DeletePermissionPort');
export interface DeletePermissionPort {
  execute(permissionId: string): Promise<void>;
}
