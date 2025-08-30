import { CreateRoleCommand } from 'src/auth/domain/ports/inbound';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { NameVo } from 'src/shared/domain/value-objects';
import { CreateRoleResponseDto } from '../dtos/create-role-response.dto';
import { Role } from 'src/auth/domain/entities/role.entity';

export class CreateRoleMapper {
  static toCommand(createRoleDto: CreateRoleDto): CreateRoleCommand {
    return {
      name: NameVo.of(createRoleDto.name),
      description: createRoleDto.description,
      realm: NameVo.of(createRoleDto.realm),
    };
  }

  static toResponse(role: Role): CreateRoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      realm: role.realm,
    };
  }
}
