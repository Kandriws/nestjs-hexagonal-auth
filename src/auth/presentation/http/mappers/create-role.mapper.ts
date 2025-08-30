import { RoleCommand } from 'src/auth/domain/ports/inbound';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { NameVo } from 'src/shared/domain/value-objects';
import { RoleResponseDto } from '../dtos/role-response.dto';
import { Role } from 'src/auth/domain/entities/role.entity';

export class CreateRoleMapper {
  static toCommand(createRoleDto: CreateRoleDto): RoleCommand {
    return {
      name: NameVo.of(createRoleDto.name),
      description: createRoleDto.description,
      realm: NameVo.of(createRoleDto.realm),
    };
  }

  static toResponse(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      realm: role.realm,
    };
  }
}
