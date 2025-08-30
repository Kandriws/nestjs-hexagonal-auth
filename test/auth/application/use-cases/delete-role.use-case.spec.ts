import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRoleUseCase } from 'src/auth/application/use-cases/delete-role.use-case';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';

describe('DeleteRoleUseCase', () => {
  let useCase: DeleteRoleUseCase;
  let repo: jest.Mocked<RoleRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoleUseCase,
        { provide: RoleRepositoryPort, useValue: { delete: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(DeleteRoleUseCase);
    repo = module.get(RoleRepositoryPort);
  });

  it('calls repository delete', async () => {
    repo.delete.mockResolvedValue(undefined);
    await useCase.execute('r1');
    expect(repo.delete).toHaveBeenCalledWith('r1');
  });
});
