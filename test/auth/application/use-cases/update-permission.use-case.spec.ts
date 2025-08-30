import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePermissionUseCase } from 'src/auth/application/use-cases/update-permission.use-case';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { PermissionNotFoundException } from 'src/auth/domain/exceptions';
import { NameVo } from 'src/shared/domain/value-objects';

describe('UpdatePermissionUseCase', () => {
  let useCase: UpdatePermissionUseCase;
  let permissionRepository: jest.Mocked<PermissionRepositoryPort>;

  const existing = Permission.create({
    id: 'perm-1',
    name: NameVo.of('read'),
    realm: NameVo.of('internal'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePermissionUseCase,
        {
          provide: PermissionRepositoryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(UpdatePermissionUseCase);
    permissionRepository = module.get(PermissionRepositoryPort);
  });

  it('updates an existing permission and saves it', async () => {
    const cmd = { permissionId: existing.id, name: NameVo.of('write') };
    permissionRepository.findById.mockResolvedValue(existing);
    permissionRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(cmd);

    expect(permissionRepository.findById).toHaveBeenCalledWith(
      cmd.permissionId,
    );
    expect(permissionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: existing.id }),
    );
    expect(result.id).toBe(existing.id);
    expect(result.name).toBe(cmd.name.getValue());
  });

  it('throws PermissionNotFoundException when not found', async () => {
    permissionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute({ permissionId: 'no' })).rejects.toThrow(
      PermissionNotFoundException,
    );
  });

  it('propagates repository errors', async () => {
    const err = new Error('db');
    permissionRepository.findById.mockRejectedValue(err);
    await expect(
      useCase.execute({ permissionId: existing.id }),
    ).rejects.toThrow(err);
  });
});
