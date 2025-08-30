import {
  CreatePermissionUseCase,
  FindPermissionsUseCase,
  FindPermissionByIdUseCase,
  UpdatePermissionUseCase,
  DeletePermissionUseCase,
} from './application/use-cases';
import {
  CreatePermissionPort,
  FindPermissionsPort,
  FindPermissionByIdPort,
  UpdatePermissionPort,
  DeletePermissionPort,
} from './domain/ports/inbound';
import { PermissionRepositoryPort } from './domain/ports/outbound/persistence/permission.repository.port';
import { PrismaPermissionRepositoryAdapter } from './infrastructure/adapters/outbound/persistence/prisma-permission.repository.adapter';

export const useCaseProviders = [
  { provide: CreatePermissionPort, useClass: CreatePermissionUseCase },
  { provide: FindPermissionsPort, useClass: FindPermissionsUseCase },
  { provide: FindPermissionByIdPort, useClass: FindPermissionByIdUseCase },
  { provide: UpdatePermissionPort, useClass: UpdatePermissionUseCase },
  { provide: DeletePermissionPort, useClass: DeletePermissionUseCase },
];

export const persistenceProviders = [
  {
    provide: PermissionRepositoryPort,
    useClass: PrismaPermissionRepositoryAdapter,
  },
];

export const permissionProviders = [
  ...useCaseProviders,
  ...persistenceProviders,
];
