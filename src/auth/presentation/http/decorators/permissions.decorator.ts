import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from 'src/auth/constants/auth-metadata-keys.constant';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
