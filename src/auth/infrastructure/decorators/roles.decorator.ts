import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Use to declare required roles for a route.
 * Example: @Roles('admin')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
