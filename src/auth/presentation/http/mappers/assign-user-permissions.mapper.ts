import { UserId } from 'src/shared/domain/types';
import { AssignUserPermissionsDto } from '../dtos/assign-user-permissions.dto';
import { AssignUserPermissionsCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-permissions.command';

export class AssignUserPermissionsMapper {
  static toCommand(
    userId: string,
    dto: AssignUserPermissionsDto,
    assignedById?: string | null,
  ): AssignUserPermissionsCommand {
    return {
      userId,
      permissionIds: dto.permissionIds || [],
      assignedById: assignedById ? (assignedById as UserId) : null,
    } as AssignUserPermissionsCommand;
  }
}
