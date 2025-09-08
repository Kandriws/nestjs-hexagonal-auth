import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentUserUseCase } from 'src/auth/application/use-cases/get-current-user.use-case';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/role.repository.port';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { createMockUser } from '../../../shared/test-helpers';
import { UserNotFoundException } from 'src/auth/domain/exceptions';
import { User } from 'src/auth/domain/entities/user.entity';

describe('GetCurrentUserUseCase (alternate file)', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepo: jest.Mocked<UserRepositoryPort>;
  let roleRepo: jest.Mocked<RoleRepositoryPort>;
  let permissionRepo: jest.Mocked<PermissionRepositoryPort>;

  const mockUser = createMockUser();
  const mockRoles = [{ id: 'r1', name: 'admin' }];
  const mockPermissions = [{ id: 'p1', name: 'read' }];

  beforeEach(async () => {
    const userRepoMock = { findById: jest.fn() };
    const roleRepoMock = { findByUserId: jest.fn() };
    const permissionRepoMock = { findByUserId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentUserUseCase,
        { provide: UserRepositoryPort, useValue: userRepoMock },
        { provide: RoleRepositoryPort, useValue: roleRepoMock },
        { provide: PermissionRepositoryPort, useValue: permissionRepoMock },
      ],
    }).compile();

    useCase = module.get(GetCurrentUserUseCase);
    userRepo = module.get(UserRepositoryPort) as any;
    roleRepo = module.get(RoleRepositoryPort) as any;
    permissionRepo = module.get(PermissionRepositoryPort) as any;
  });

  it('returns user with roles and permissions when user exists', async () => {
    userRepo.findById.mockResolvedValue(mockUser as unknown as User);
    roleRepo.findByUserId.mockResolvedValue(mockRoles as any);
    permissionRepo.findByUserId.mockResolvedValue(mockPermissions as any);

    const res = await useCase.execute(mockUser.id);

    expect(userRepo.findById).toHaveBeenCalledWith(mockUser.id);
    expect(roleRepo.findByUserId).toHaveBeenCalledWith(mockUser.id);
    expect(permissionRepo.findByUserId).toHaveBeenCalledWith(mockUser.id);

    expect(res.user).toEqual(mockUser);
    expect(res.roles).toBe(mockRoles);
    expect(res.permissions).toBe(mockPermissions);
  });

  it('throws UserNotFoundException when user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent' as any)).rejects.toThrow(
      UserNotFoundException,
    );
  });
});
