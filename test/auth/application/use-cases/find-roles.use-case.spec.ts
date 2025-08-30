import { Test, TestingModule } from '@nestjs/testing';
import { FindRolesUseCase } from 'src/auth/application/use-cases/find-roles.use-case';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { Role } from 'src/auth/domain/entities/role.entity';
import { NameVo } from 'src/shared/domain/value-objects';

describe('FindRolesUseCase', () => {
  let useCase: FindRolesUseCase;
  let roleRepo: jest.Mocked<RoleRepositoryPort>;

  const list = [
    Role.create({
      id: 'r1',
      name: NameVo.of('RoleA'),
      description: '',
      realm: NameVo.of('internal'),
    }),
    Role.create({
      id: 'r2',
      name: NameVo.of('RoleB'),
      description: '',
      realm: NameVo.of('internal'),
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindRolesUseCase,
        { provide: RoleRepositoryPort, useValue: { findAll: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(FindRolesUseCase);
    roleRepo = module.get(RoleRepositoryPort);
  });

  it('returns list from repository', async () => {
    roleRepo.findAll.mockResolvedValue(list);
    const res = await useCase.execute();
    expect(roleRepo.findAll).toHaveBeenCalled();
    expect(res).toBe(list);
  });
});
