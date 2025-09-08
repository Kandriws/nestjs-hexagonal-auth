import { AssignRolePermissionsDto } from '../dtos/assign-role-permissions.dto';
import { AssignRolePermissionsCommand } from 'src/auth/domain/ports/inbound/commands/assign-role-permissions.command';

export class AssignRolePermissionsMapper {
  static toCommand(
    roleId: string,
    dto: AssignRolePermissionsDto,
  ): AssignRolePermissionsCommand {
    return {
      roleId,
      permissionIds: dto.permissionIds || [],
    };
  }
}
