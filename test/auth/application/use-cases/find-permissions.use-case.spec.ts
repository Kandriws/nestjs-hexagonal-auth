import { Test, TestingModule } from '@nestjs/testing';
import { FindPermissionsUseCase } from 'src/auth/application/use-cases/find-permissions.use-case';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { Permission } from 'src/auth/domain/entities/permission.entity';
import { NameVo } from 'src/shared/domain/value-objects';

describe('FindPermissionsUseCase', () => {
  let useCase: FindPermissionsUseCase;
  let permRepo: jest.Mocked<PermissionRepositoryPort>;

  const list = [
    Permission.create({
      id: 'p1',
      name: NameVo.of('read'),
      realm: NameVo.of('internal'),
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPermissionsUseCase,
        { provide: PermissionRepositoryPort, useValue: { findAll: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(FindPermissionsUseCase);
    permRepo = module.get(PermissionRepositoryPort);
  });

  it('returns permissions list', async () => {
    permRepo.findAll.mockResolvedValue(list);
    const res = await useCase.execute();
    expect(permRepo.findAll).toHaveBeenCalled();
    expect(res).toBe(list);
  });
});
