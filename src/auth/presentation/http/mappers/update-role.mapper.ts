import { UpdateRoleDto } from '../dtos/update-role.dto';
import { UpdateRoleCommand } from 'src/auth/domain/ports/inbound';
import { NameVo } from 'src/shared/domain/value-objects';

export class UpdateRoleMapper {
  static toCommand(id: string, dto: UpdateRoleDto): UpdateRoleCommand {
    const command: UpdateRoleCommand = { roleId: id } as UpdateRoleCommand;
    if (dto.name !== undefined) command.name = NameVo.of(dto.name);
    if (dto.description !== undefined) command.description = dto.description;
    if (dto.realm !== undefined) command.realm = NameVo.of(dto.realm);
    return command;
  }
}
