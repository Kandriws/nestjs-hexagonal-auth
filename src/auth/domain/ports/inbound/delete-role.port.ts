export const DeleteRolePort = Symbol('DeleteRolePort');
export interface DeleteRolePort {
  execute(roleId: string): Promise<void>;
}
