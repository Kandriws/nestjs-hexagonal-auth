import { Test, TestingModule } from '@nestjs/testing';
import { CreateRoleUseCase } from 'src/auth/application/use-cases';
import { RoleCommand } from 'src/auth/domain/ports/inbound';
import { RoleRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security';
import { NameVo } from 'src/shared/domain/value-objects';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let roleRepository: jest.Mocked<RoleRepositoryPort>;
  let uuidService: jest.Mocked<UUIDPort>;

  const mockId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleUseCase,
        {
          provide: RoleRepositoryPort,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UUIDPort,
          useValue: {
            generate: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    roleRepository = module.get(RoleRepositoryPort);
    uuidService = module.get(UUIDPort);
  });

  describe('execute', () => {
    const validCommand: RoleCommand = {
      name: NameVo.of('Admin'),
      description: 'Administrator role',
      realm: NameVo.of('internal'),
    };

    it('should create and save a role successfully', async () => {
      roleRepository.save.mockResolvedValue(undefined);
      uuidService.generate.mockReturnValue(mockId);

      const result = await useCase.execute(validCommand);

      expect(uuidService.generate).toHaveBeenCalled();
      expect(roleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockId,
        }),
      );

      // verify returned value has expected properties
      expect(result.id).toBe(mockId);
      expect(result.name).toBe(validCommand.name.getValue());
      expect(result.realm).toBe(validCommand.realm.getValue());
    });

    it('should propagate repository save errors', async () => {
      const saveError = new Error('Save failed');
      roleRepository.save.mockRejectedValue(saveError);
      uuidService.generate.mockReturnValue(mockId);

      await expect(useCase.execute(validCommand)).rejects.toThrow(saveError);
    });
  });
});
