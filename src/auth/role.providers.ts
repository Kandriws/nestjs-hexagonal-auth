import { CreateRoleUseCase } from './application/use-cases';
import { CreateRolePort } from './domain/ports/inbound';
import { RoleRepositoryPort } from './domain/ports/outbound/persistence';
import { PrismaRoleRepositoryAdapter } from './infrastructure/adapters/outbound/persistence';

export const useCaseProviders = [
  {
    provide: CreateRolePort,
    useClass: CreateRoleUseCase,
  },
];

export const persistenceProviders = [
  {
    provide: RoleRepositoryPort,
    useClass: PrismaRoleRepositoryAdapter,
  },
];

export const roleProviders = [...useCaseProviders, ...persistenceProviders];
