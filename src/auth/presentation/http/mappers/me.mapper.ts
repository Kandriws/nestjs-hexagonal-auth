import { MeResponseDto } from '../dtos';

export class MeMapper {
  static toDto(payload: {
    user: any;
    roles: any[];
    permissions: any[];
  }): MeResponseDto {
    const userDto = {
      id: payload.user.id,
      email: payload.user.email.getValue(),
      firstName: payload.user.firstName.getValue(),
      lastName: payload.user.lastName.getValue(),
      verifiedAt: payload.user.verifiedAt ?? null,
      createdAt: payload.user.createdAt,
      updatedAt: payload.user.updatedAt,
    };

    const roles = payload.roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? null,
      realm: role.realm,
    }));

    const permissions = payload.permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      realm: permission.realm,
    }));

    return { user: userDto, roles, permissions } as MeResponseDto;
  }
}
