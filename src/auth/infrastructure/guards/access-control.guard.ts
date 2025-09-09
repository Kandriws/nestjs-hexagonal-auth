import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';

@Injectable()
export class AccessControlGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      (!requiredRoles || requiredRoles.length === 0) &&
      (!requiredPermissions || requiredPermissions.length === 0)
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    let userRoles: string[] = [];
    let userPermissions: string[] = [];

    if (user instanceof TokenPayloadVo) {
      userRoles = user.getRoles();
      userPermissions = user.getPermissions();
    } else {
      const rawRoles = Array.isArray(user.roles) ? user.roles : [];
      const rawPermissions = Array.isArray(user.permissions)
        ? user.permissions
        : [];

      userRoles = rawRoles
        .map((r: any) => (typeof r === 'string' ? r : r?.name))
        .filter(Boolean);
      userPermissions = rawPermissions
        .map((p: any) => (typeof p === 'string' ? p : p?.name))
        .filter(Boolean);
    }

    if (requiredRoles?.some((role) => userRoles.includes(role))) return true;
    if (requiredPermissions?.some((perm) => userPermissions.includes(perm)))
      return true;

    return false;
  }
}
