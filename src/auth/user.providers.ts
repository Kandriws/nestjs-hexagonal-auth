import {
  AssignPermissionsToUserUseCase,
  AssignRolesToUserUseCase,
} from './application/use-cases';
import { FindUsersUseCase } from './application/use-cases/find-users.use-case';
import {
  AssignUserPermissionsPort,
  AssignUserRolesPort,
  FindUsersPort,
} from './domain/ports/inbound';
import { UserRepositoryPort } from './domain/ports/outbound/persistence';
import { PrismaUserRepositoryAdapter } from './infrastructure/adapters/outbound/persistence';

export const useCaseProviders = [
  {
    provide: FindUsersPort,
    useClass: FindUsersUseCase,
  },
  {
    provide: AssignUserRolesPort,
    useClass: AssignRolesToUserUseCase,
  },
  {
    provide: AssignUserPermissionsPort,
    useClass: AssignPermissionsToUserUseCase,
  },
];

export const persistenceProviders = [
  {
    provide: UserRepositoryPort,
    useClass: PrismaUserRepositoryAdapter,
  },
];

export const userProviders = [...useCaseProviders, ...persistenceProviders];

export default userProviders;
