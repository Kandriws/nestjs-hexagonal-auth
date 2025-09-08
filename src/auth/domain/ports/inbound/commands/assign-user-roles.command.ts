import { UserId } from 'src/shared/domain/types';

export interface AssignUserRolesCommand {
  userId: UserId;
  roleIds: string[];
  assignedById?: UserId | null;
}
