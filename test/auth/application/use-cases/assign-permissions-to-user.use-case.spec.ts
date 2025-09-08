import { AssignPermissionsToUserUseCase } from 'src/auth/application/use-cases/assign-permissions-to-user.use-case';
import { AssignUserPermissionsCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-permissions.command';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import {
  UserNotFoundException,
  PermissionNotFoundException,
} from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';
import { createMock } from '../../../shared/test-helpers';

describe('AssignPermissionsToUserUseCase', () => {
  let useCase: AssignPermissionsToUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    userRepository = createMock<UserRepositoryPort>();
    permissionRepository = createMock<PermissionRepositoryPort>();

    useCase = new AssignPermissionsToUserUseCase(
      userRepository,
      permissionRepository,
    );
  });

  describe('execute', () => {
    const userId = 'user-1' as UserId;
    const permissionIds = ['p1', 'p2'];
    const assignedById = 'admin-1' as UserId;

    it('assigns permissions when user and permissions exist', async () => {
      userRepository.findById.mockResolvedValue({ id: userId } as any);
      permissionRepository.findById.mockImplementation(
        async (id: string) => ({ id }) as any,
      );
      userRepository.assignPermissions.mockResolvedValue(undefined);

      const command: AssignUserPermissionsCommand = {
        userId,
        permissionIds,
        assignedById,
      };
      await expect(useCase.execute(command)).resolves.toBeUndefined();

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(permissionRepository.findById).toHaveBeenCalledTimes(
        permissionIds.length,
      );

      for (const id of permissionIds)
        expect(permissionRepository.findById).toHaveBeenCalledWith(id);

      expect(userRepository.assignPermissions).toHaveBeenCalledWith(
        userId,
        permissionIds,
        assignedById,
      );
    });

    it('throws UserNotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const command: AssignUserPermissionsCommand = {
        userId,
        permissionIds,
      };
      await expect(useCase.execute(command)).rejects.toBeInstanceOf(
        UserNotFoundException,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(permissionRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.assignPermissions).not.toHaveBeenCalled();
    });

    it('throws PermissionNotFoundException when any permission does not exist', async () => {
      userRepository.findById.mockResolvedValue({ id: userId } as any);
      permissionRepository.findById.mockImplementation(async (id: string) => {
        if (id === 'p1') return { id } as any;
        return null;
      });

      const command: AssignUserPermissionsCommand = {
        userId,
        permissionIds,
      };
      await expect(useCase.execute(command)).rejects.toBeInstanceOf(
        PermissionNotFoundException,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(permissionRepository.findById).toHaveBeenCalled();
      expect(userRepository.assignPermissions).not.toHaveBeenCalled();
    });

    it('propagates errors from repository.assignPermissions', async () => {
      userRepository.findById.mockResolvedValue({ id: userId } as any);
      permissionRepository.findById.mockImplementation(
        async (id: string) => ({ id }) as any,
      );
      const repoError = new Error('assign failed');
      userRepository.assignPermissions.mockRejectedValue(repoError);

      const command: AssignUserPermissionsCommand = {
        userId,
        permissionIds,
      };
      await expect(useCase.execute(command)).rejects.toThrow(repoError);

      expect(userRepository.assignPermissions).toHaveBeenCalledWith(
        userId,
        permissionIds,
        null,
      );
    });
  });
});
