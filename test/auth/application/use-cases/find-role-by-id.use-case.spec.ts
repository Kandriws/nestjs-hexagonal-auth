import { Test, TestingModule } from '@nestjs/testing';
import { FindRoleByIdUseCase } from 'src/auth/application/use-cases/find-role-by-id.use-case';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { Role } from 'src/auth/domain/entities/role.entity';
import { NameVo } from 'src/shared/domain/value-objects';
import { RoleNotFoundException } from 'src/auth/domain/exceptions';

describe('FindRoleByIdUseCase', () => {
  let useCase: FindRoleByIdUseCase;
  let roleRepo: jest.Mocked<RoleRepositoryPort>;

  const existing = Role.create({
    id: 'r1',
    name: NameVo.of('Admin'),
    description: 'desc',
    realm: NameVo.of('internal'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindRoleByIdUseCase,
        { provide: RoleRepositoryPort, useValue: { findById: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(FindRoleByIdUseCase);
    roleRepo = module.get(RoleRepositoryPort);
  });

  it('returns role when found', async () => {
    roleRepo.findById.mockResolvedValue(existing);
    const result = await useCase.execute(existing.id);
    expect(roleRepo.findById).toHaveBeenCalledWith(existing.id);
    expect(result.id).toBe(existing.id);
  });

  it('throws RoleNotFoundException when missing', async () => {
    roleRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('no')).rejects.toThrow(RoleNotFoundException);
  });
});
