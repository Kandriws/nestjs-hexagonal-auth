import { Test, TestingModule } from '@nestjs/testing';
import { CreatePermissionUseCase } from 'src/auth/application/use-cases/create-permission.use-case';
import { PermissionRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/permission.repository.port';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security';
import { NameVo } from 'src/shared/domain/value-objects';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
  let permRepo: jest.Mocked<PermissionRepositoryPort>;
  let uuid: jest.Mocked<UUIDPort>;

  const mockId = 'id-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePermissionUseCase,
        { provide: PermissionRepositoryPort, useValue: { save: jest.fn() } },
        { provide: UUIDPort, useValue: { generate: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(CreatePermissionUseCase);
    permRepo = module.get(PermissionRepositoryPort);
    uuid = module.get(UUIDPort);
  });

  it('creates and saves permission', async () => {
    permRepo.save.mockResolvedValue(undefined);
    uuid.generate.mockReturnValue(mockId);

    const cmd = {
      name: NameVo.of('Read'),
      realm: NameVo.of('internal'),
    } as any;
    const res = await useCase.execute(cmd);

    expect(uuid.generate).toHaveBeenCalled();
    expect(permRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: mockId }),
    );
    expect(res.id).toBe(mockId);
  });
});
