import { UpdatePermissionCommand } from 'src/auth/domain/ports/inbound/commands/update-permission.command';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { NameVo } from 'src/shared/domain/value-objects';

export class UpdatePermissionMapper {
  static toCommand(
    id: string,
    dto: UpdatePermissionDto,
  ): UpdatePermissionCommand {
    const command: UpdatePermissionCommand = {
      permissionId: id,
    } as UpdatePermissionCommand;
    if (dto.name !== undefined) command.name = NameVo.of(dto.name);
    if (dto.realm !== undefined) command.realm = NameVo.of(dto.realm);
    return command;
  }
}
