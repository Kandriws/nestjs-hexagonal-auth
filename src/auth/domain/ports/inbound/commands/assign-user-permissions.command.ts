import { UserId } from 'src/shared/domain/types';

export interface AssignUserPermissionsCommand {
  userId: UserId;
  permissionIds: string[];
  assignedById?: UserId | null;
}
