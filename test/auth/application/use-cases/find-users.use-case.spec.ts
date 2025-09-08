import { Test, TestingModule } from '@nestjs/testing';
import { FindUsersUseCase } from 'src/auth/application/use-cases/find-users.use-case';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/user.repository.port';
import { User } from 'src/auth/domain/entities/user.entity';

describe('FindUsersUseCase', () => {
  let useCase: FindUsersUseCase;
  let userRepo: jest.Mocked<UserRepositoryPort>;

  const list = [
    User.create({
      id: 'u1' as any,
      email: 'u1@example.com',
      password: 'SecurePass123!',
      firstName: 'First',
      lastName: 'One',
    }),
    User.create({
      id: 'u2' as any,
      email: 'u2@example.com',
      password: 'SecurePass123!',
      firstName: 'Second',
      lastName: 'Two',
    }),
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUsersUseCase,
        { provide: UserRepositoryPort, useValue: { findAll: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(FindUsersUseCase);
    userRepo = module.get(UserRepositoryPort) as any;
  });

  it('returns users list', async () => {
    userRepo.findAll.mockResolvedValue(list as any);
    const res = await useCase.execute();
    expect(userRepo.findAll).toHaveBeenCalled();
    expect(res).toBe(list);
  });
});
