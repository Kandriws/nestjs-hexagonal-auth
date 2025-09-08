import { UserId } from 'src/shared/domain/types';
import { AssignUserRolesDto } from '../dtos/assign-user-roles.dto';
import { AssignUserRolesCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-roles.command';

export class AssignUserRolesMapper {
  static toCommand(
    userId: string,
    dto: AssignUserRolesDto,
    assignedById?: string | null,
  ): AssignUserRolesCommand {
    return {
      userId: userId as UserId,
      roleIds: dto.roleIds || [],
      assignedById: assignedById ? (assignedById as UserId) : null,
    };
  }
}
