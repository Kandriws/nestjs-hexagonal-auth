import { PermissionCommand } from 'src/auth/domain/ports/inbound/commands/permission.command';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { NameVo } from 'src/shared/domain/value-objects';
import { PermissionResponseDto } from '../dtos/permission-response.dto';
import { Permission } from 'src/auth/domain/entities/permission.entity';

export class CreatePermissionMapper {
  static toCommand(
    createPermissionDto: CreatePermissionDto,
  ): PermissionCommand {
    return {
      name: NameVo.of(createPermissionDto.name),
      realm: NameVo.of(createPermissionDto.realm),
    };
  }

  static toResponse(permission: Permission): PermissionResponseDto {
    return {
      id: permission.id,
      name: permission.name,
      realm: permission.realm,
    };
  }
}
