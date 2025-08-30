import { Role } from 'src/auth/domain/entities/role.entity';
import { Role as PrismaRole } from 'generated/prisma';
import { NameVo } from 'src/shared/domain/value-objects';
export class RoleMapper {
  static toDomain(role: PrismaRole): Role {
    return Role.reconstitute({
      id: role.id,
      name: NameVo.of(role.name),
      description: role.description,
      realm: NameVo.of(role.realm),
    });
  }

  static toPersistence(role: Role): PrismaRole {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      realm: role.realm,
    } as unknown as PrismaRole;
  }
}
