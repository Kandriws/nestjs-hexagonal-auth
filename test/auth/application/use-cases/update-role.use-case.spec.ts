import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRoleUseCase } from 'src/auth/application/use-cases/update-role.use-case';
import { UpdateRoleCommand } from 'src/auth/domain/ports/inbound';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { Role } from 'src/auth/domain/entities/role.entity';
import { NameVo } from 'src/shared/domain/value-objects';
import { RoleNotFoundException } from 'src/auth/domain/exceptions';

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;
  let roleRepository: jest.Mocked<RoleRepositoryPort>;

  const existingRole = Role.create({
    id: '22222222-2222-2222-2222-222222222222',
    name: NameVo.of('User'),
    description: 'Regular user',
    realm: NameVo.of('internal'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoleUseCase,
        {
          provide: RoleRepositoryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateRoleUseCase>(UpdateRoleUseCase);
    roleRepository = module.get(RoleRepositoryPort);
  });

  describe('execute', () => {
    it('should update an existing role and save it', async () => {
      const cmd: UpdateRoleCommand = {
        roleId: existingRole.id,
        name: NameVo.of('PowerUser'),
        description: 'Power user',
      };

      roleRepository.findById.mockResolvedValue(existingRole);
      roleRepository.save.mockResolvedValue(undefined);

      const result = await useCase.execute(cmd);

      expect(roleRepository.findById).toHaveBeenCalledWith(cmd.roleId);
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: existingRole.id }),
      );

      expect(result.id).toBe(existingRole.id);
      expect(result.name).toBe(cmd.name!.getValue());
    });

    it('should throw RoleNotFoundException when role does not exist', async () => {
      const cmd: UpdateRoleCommand = {
        roleId: 'non-existent-id',
        name: NameVo.of('No'),
      };

      roleRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(cmd)).rejects.toThrow(RoleNotFoundException);
      expect(roleRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors from findById', async () => {
      const cmd: UpdateRoleCommand = { roleId: existingRole.id };
      const err = new Error('DB error');
      roleRepository.findById.mockRejectedValue(err);

      await expect(useCase.execute(cmd)).rejects.toThrow(err);
    });

    it('should propagate repository errors from save', async () => {
      const cmd: UpdateRoleCommand = {
        roleId: existingRole.id,
        name: NameVo.of('Another'),
      };
      roleRepository.findById.mockResolvedValue(existingRole);
      const saveErr = new Error('Save failed');
      roleRepository.save.mockRejectedValue(saveErr);

      await expect(useCase.execute(cmd)).rejects.toThrow(saveErr);
    });
  });
});
