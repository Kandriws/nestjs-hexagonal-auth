import {
  CreateRoleUseCase,
  FindRoleByIdUseCase,
  DeleteRoleUseCase,
  FindRolesUseCase,
  UpdateRoleUseCase,
  AssignPermissionsToRoleUseCase,
} from './application/use-cases';
import {
  CreateRolePort,
  DeleteRolePort,
  UpdateRolePort,
  FindRolesPort,
  FindRoleByIdPort,
  AssignRolePermissionsPort,
} from './domain/ports/inbound';
import { RoleRepositoryPort } from './domain/ports/outbound/persistence';
import { PrismaRoleRepositoryAdapter } from './infrastructure/adapters/outbound/persistence';

export const useCaseProviders = [
  {
    provide: CreateRolePort,
    useClass: CreateRoleUseCase,
  },
  {
    provide: FindRolesPort,
    useClass: FindRolesUseCase,
  },
  {
    provide: FindRoleByIdPort,
    useClass: FindRoleByIdUseCase,
  },
  {
    provide: UpdateRolePort,
    useClass: UpdateRoleUseCase,
  },
  {
    provide: AssignRolePermissionsPort,
    useClass: AssignPermissionsToRoleUseCase,
  },
  {
    provide: DeleteRolePort,
    useClass: DeleteRoleUseCase,
  },
];

export const persistenceProviders = [
  {
    provide: RoleRepositoryPort,
    useClass: PrismaRoleRepositoryAdapter,
  },
];

export const roleProviders = [...useCaseProviders, ...persistenceProviders];
