import { AssignPermissionsToRoleUseCase } from 'src/auth/application/use-cases/assign-permissions-to-role.use-case';
import { AssignRolePermissionsCommand } from 'src/auth/domain/ports/inbound/commands/assign-role-permissions.command';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/role.repository.port';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import {
  RoleNotFoundException,
  PermissionNotFoundException,
} from 'src/auth/domain/exceptions';
import { createMock } from '../../../shared/test-helpers';

describe('AssignPermissionsToRoleUseCase', () => {
  let useCase: AssignPermissionsToRoleUseCase;
  let roleRepository: jest.Mocked<RoleRepositoryPort>;
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(() => {
    roleRepository = createMock<RoleRepositoryPort>();
    permissionRepository = createMock<PermissionRepositoryPort>();

    useCase = new AssignPermissionsToRoleUseCase(
      roleRepository,
      permissionRepository,
    );
  });

  describe('execute', () => {
    const roleId = 'role-1';
    const permissionIds = ['perm-1', 'perm-2'];

    it('assigns permissions when role and permissions exist', async () => {
      roleRepository.findById.mockResolvedValue({ id: roleId } as any);
      // permissions exist
      permissionRepository.findById.mockImplementation(
        async (id: string) => ({ id }) as any,
      );
      roleRepository.assignPermissions.mockResolvedValue(undefined);

      const command: AssignRolePermissionsCommand = { roleId, permissionIds };

      await expect(useCase.execute(command)).resolves.toBeUndefined();

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(permissionRepository.findById).toHaveBeenCalledTimes(
        permissionIds.length,
      );
      for (const id of permissionIds)
        expect(permissionRepository.findById).toHaveBeenCalledWith(id);
      expect(roleRepository.assignPermissions).toHaveBeenCalledWith(
        roleId,
        permissionIds,
      );
    });

    it('throws RoleNotFoundException when role does not exist', async () => {
      roleRepository.findById.mockResolvedValue(null);

      const command: AssignRolePermissionsCommand = { roleId, permissionIds };

      await expect(useCase.execute(command)).rejects.toBeInstanceOf(
        RoleNotFoundException,
      );

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(permissionRepository.findById).not.toHaveBeenCalled();
      expect(roleRepository.assignPermissions).not.toHaveBeenCalled();
    });

    it('throws PermissionNotFoundException when any permission does not exist', async () => {
      roleRepository.findById.mockResolvedValue({ id: roleId } as any);
      // first permission exists, second does not
      permissionRepository.findById.mockImplementation(async (id: string) => {
        if (id === 'perm-1') return { id } as any;
        return null;
      });

      const command: AssignRolePermissionsCommand = { roleId, permissionIds };

      await expect(useCase.execute(command)).rejects.toBeInstanceOf(
        PermissionNotFoundException,
      );

      expect(roleRepository.findById).toHaveBeenCalledWith(roleId);
      expect(permissionRepository.findById).toHaveBeenCalled();
      expect(roleRepository.assignPermissions).not.toHaveBeenCalled();
    });
  });
});
