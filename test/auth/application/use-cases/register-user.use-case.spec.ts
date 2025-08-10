import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from '../../../../src/auth/application/use-cases/register-user.use-case';
import { UserRepositoryPort } from '../../../../src/auth/domain/ports/outbound/persistence/user.repository.port';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security/uuid.port';
import { HasherPort } from 'src/auth/domain/ports/outbound/security/hasher.port';
import { OtpGeneratorPort } from 'src/auth/domain/ports/outbound/security/otp-generator.port';
import { OtpRepositoryPort } from 'src/auth/domain/ports/outbound/persistence/otp.repository.port';
import { OtpPolicyPort } from 'src/auth/domain/ports/outbound/policy/otp-policy.port';
import { OtpNotificationPort } from 'src/auth/domain/ports/outbound/notification/otp-notification.port';
import { UserId } from 'src/shared/domain/types';
import { RegisterUserCommand } from 'src/auth/domain/ports/inbound/commands/register-user.command';
import { User } from 'src/auth/domain/entities';
import { EmailVo, NameVo, PasswordVo } from 'src/shared/domain/value-objects';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let uuidService: jest.Mocked<UUIDPort>;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000' as UserId;
  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    password: 'hashedPassword123!',
    firstName: 'John',
    lastName: 'Doe',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: UserRepositoryPort,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UUIDPort,
          useValue: {
            generate: jest.fn(),
          },
        },
        {
          provide: HasherPort,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword123!'),
          },
        },
        {
          provide: OtpGeneratorPort,
          useValue: {
            generate: jest.fn().mockResolvedValue('123456'),
          },
        },
        {
          provide: OtpRepositoryPort,
          useValue: {
            save: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: OtpPolicyPort,
          useValue: {
            ttlMinutes: jest.fn().mockReturnValue(10),
          },
        },
        {
          provide: OtpNotificationPort,
          useValue: {
            send: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userRepository = module.get(UserRepositoryPort);
    uuidService = module.get(UUIDPort);
  });

  describe('execute', () => {
    const validCommand: RegisterUserCommand = {
      email: EmailVo.of('test@example.com'),
      password: PasswordVo.of('SecurePass123!'),
      firstName: NameVo.of('John'),
      lastName: NameVo.of('Doe'),
    };

    it('should register a new user successfully when email does not exist', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      uuidService.generate.mockReturnValue(mockUserId);
      userRepository.save.mockResolvedValue();

      // Act
      await useCase.execute(validCommand);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validCommand.email.getValue(),
      );
      expect(uuidService.generate).toHaveBeenCalled();
      // Comprobar que se guarda una instancia de User y que el snapshot es correcto
      // Assert
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          snap: expect.objectContaining({
            id: mockUserId,
            email: expect.objectContaining({
              value: validCommand.email.getValue(),
            }),
            password: expect.objectContaining({
              value: 'hashedPassword123!',
            }),
            firstName: expect.objectContaining({
              value: validCommand.firstName.getValue(),
            }),
            lastName: expect.objectContaining({
              value: validCommand.lastName.getValue(),
            }),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should throw error when user already exists', async () => {
      // Arrange
      const existingUser = User.create(mockUser);
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(validCommand)).rejects.toThrow(
        'User already exists',
      );

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validCommand.email.getValue(),
      );
      expect(uuidService.generate).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors when findByEmail fails', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      userRepository.findByEmail.mockRejectedValue(repositoryError);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        repositoryError,
      );
    });

    it('should propagate repository errors when save fails', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      uuidService.generate.mockReturnValue(mockUserId);
      const saveError = new Error('Failed to save user');
      userRepository.save.mockRejectedValue(saveError);

      // Act & Assert
      await expect(useCase.execute(validCommand)).rejects.toThrow(saveError);
    });

    it('should create user with exact command data', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      uuidService.generate.mockReturnValue(mockUserId);
      userRepository.save.mockResolvedValue();

      // Act
      await useCase.execute(validCommand);

      // Assert
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          snap: expect.objectContaining({
            id: mockUserId,
            email: expect.objectContaining({
              value: validCommand.email.getValue(),
            }),
            password: expect.objectContaining({
              value: 'hashedPassword123!',
            }),
            firstName: expect.objectContaining({
              value: validCommand.firstName.getValue(),
            }),
            lastName: expect.objectContaining({
              value: validCommand.lastName.getValue(),
            }),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
