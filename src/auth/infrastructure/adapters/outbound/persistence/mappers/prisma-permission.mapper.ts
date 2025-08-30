import { Permission } from 'src/auth/domain/entities/permission.entity';
import { NameVo } from 'src/shared/domain/value-objects';

export class PrismaPermissionMapper {
  static toDomain(raw: any): Permission {
    return Permission.reconstitute({
      id: raw.id,
      name: NameVo.of(raw.name),
      realm: NameVo.of(raw.realm),
    });
  }

  static toPersistence(permission: Permission) {
    return {
      id: permission.id,
      name: permission.name,
      realm: permission.realm,
    };
  }
}
