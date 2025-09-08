import { AssignRolesToUserUseCase } from 'src/auth/application/use-cases/assign-roles-to-user.use-case';
import { AssignUserRolesCommand } from 'src/auth/domain/ports/inbound/commands/assign-user-roles.command';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/role.repository.port';
import {
  UserNotFoundException,
  RoleNotFoundException,
} from 'src/auth/domain/exceptions';
import { UserId } from 'src/shared/domain/types';
import { createMock } from '../../../shared/test-helpers';

describe('AssignRolesToUserUseCase', () => {
  let useCase: AssignRolesToUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let roleRepository: jest.Mocked<RoleRepositoryPort>;

  beforeEach(() => {
    userRepository = createMock<UserRepositoryPort>();
    roleRepository = createMock<RoleRepositoryPort>();

    useCase = new AssignRolesToUserUseCase(userRepository, roleRepository);
  });

  describe('execute', () => {
    const userId = 'user-1' as UserId;
    const roleIds = ['r1', 'r2'];
    const assignedById = 'admin-1' as UserId;

    it('assigns roles when user and roles exist', async () => {
      userRepository.findById.mockResolvedValue({ id: userId } as any);
      roleRepository.findById.mockImplementation(
        async (id: string) => ({ id }) as any,
      );
      userRepository.assignRoles.mockResolvedValue(undefined);

      const command: AssignUserRolesCommand = {
        userId,
        roleIds,
        assignedById,
      };

      await expect(useCase.execute(command)).resolves.toBeUndefined();

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(roleRepository.findById).toHaveBeenCalledTimes(roleIds.length);
      for (const id of roleIds)
        expect(roleRepository.findById).toHaveBeenCalledWith(id);

      expect(userRepository.assignRoles).toHaveBeenCalledWith(
        userId,
        roleIds,
        assignedById,
      );
    });

    it('throws UserNotFoundException when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      const command: AssignUserRolesCommand = { userId, roleIds };

      await expect(useCase.execute(command)).rejects.toBeInstanceOf(
        UserNotFoundException,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(roleRepository.findById).not.toHaveBeenCalled();
      expect(userRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('throws RoleNotFoundException when any role does not exist', async () => {
      userRepository.findById.mockResolvedValue({ id: userId } as any);
      roleRepository.findById.mockImplementation(async (id: string) => {
        if (id === 'r1') return { id } as any;
        return null;
      });

      const command: AssignUserRolesCommand = { userId, roleIds };

      await expect(useCase.execute(command)).rejects.toBeInstanceOf(
        RoleNotFoundException,
      );

      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(roleRepository.findById).toHaveBeenCalled();
      expect(userRepository.assignRoles).not.toHaveBeenCalled();
    });

    it('propagates errors from repository.assignRoles', async () => {
      userRepository.findById.mockResolvedValue({ id: userId } as any);
      roleRepository.findById.mockImplementation(
        async (id: string) => ({ id }) as any,
      );
      const repoError = new Error('assignRoles failed');
      userRepository.assignRoles.mockRejectedValue(repoError);

      const command: AssignUserRolesCommand = { userId, roleIds };

      await expect(useCase.execute(command)).rejects.toThrow(repoError);

      expect(userRepository.assignRoles).toHaveBeenCalledWith(
        userId,
        roleIds,
        null,
      );
    });
  });
});
