import { Test, TestingModule } from '@nestjs/testing';
import { FindPermissionByIdUseCase } from 'src/auth/application/use-cases/find-permission-by-id.use-case';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { NameVo } from 'src/shared/domain/value-objects';
import { PermissionNotFoundException } from 'src/auth/domain/exceptions';

describe('FindPermissionByIdUseCase', () => {
  let useCase: FindPermissionByIdUseCase;
  let repo: jest.Mocked<PermissionRepositoryPort>;

  const existing = Permission.create({
    id: 'p1',
    name: NameVo.of('Read'),
    realm: NameVo.of('internal'),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPermissionByIdUseCase,
        {
          provide: PermissionRepositoryPort,
          useValue: { findById: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(FindPermissionByIdUseCase);
    repo = module.get(PermissionRepositoryPort);
  });

  it('returns permission when found', async () => {
    repo.findById.mockResolvedValue(existing);
    const res = await useCase.execute(existing.id);
    expect(repo.findById).toHaveBeenCalledWith(existing.id);
    expect(res.id).toBe(existing.id);
  });

  it('throws when not found', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('no')).rejects.toThrow(
      PermissionNotFoundException,
    );
  });
});
