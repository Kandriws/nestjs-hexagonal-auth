import {
  CreateRoleUseCase,
  DeleteRoleUseCase,
  FindRolesUseCase,
  UpdateRoleUseCase,
} from './application/use-cases';
import {
  CreateRolePort,
  DeleteRolePort,
  UpdateRolePort,
  FindRolesPort,
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
    provide: UpdateRolePort,
    useClass: UpdateRoleUseCase,
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
