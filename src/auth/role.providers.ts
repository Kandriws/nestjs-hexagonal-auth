import { CreateRoleUseCase } from './application/use-cases';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { CreateRolePort, UpdateRolePort } from './domain/ports/inbound';
import { RoleRepositoryPort } from './domain/ports/outbound/persistence';
import { PrismaRoleRepositoryAdapter } from './infrastructure/adapters/outbound/persistence';

export const useCaseProviders = [
  {
    provide: CreateRolePort,
    useClass: CreateRoleUseCase,
  },
  {
    provide: UpdateRolePort,
    useClass: UpdateRoleUseCase,
  },
];

export const persistenceProviders = [
  {
    provide: RoleRepositoryPort,
    useClass: PrismaRoleRepositoryAdapter,
  },
];

export const roleProviders = [...useCaseProviders, ...persistenceProviders];
