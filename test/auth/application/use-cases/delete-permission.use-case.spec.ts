import { Test, TestingModule } from '@nestjs/testing';
import { DeletePermissionUseCase } from 'src/auth/application/use-cases/delete-permission.use-case';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';

describe('DeletePermissionUseCase', () => {
  let useCase: DeletePermissionUseCase;
  let repo: jest.Mocked<PermissionRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePermissionUseCase,
        { provide: PermissionRepositoryPort, useValue: { delete: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(DeletePermissionUseCase);
    repo = module.get(PermissionRepositoryPort);
  });

  it('calls delete on repository', async () => {
    repo.delete.mockResolvedValue(undefined);
    await useCase.execute('p1');
    expect(repo.delete).toHaveBeenCalledWith('p1');
  });
});
