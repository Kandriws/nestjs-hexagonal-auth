import { Test, TestingModule } from '@nestjs/testing';
import { VerifyUserRegistrationUseCase } from 'src/auth/application/use-cases/verify-user-registration.use-case';
import {
  UserRepositoryPort,
  OtpRepositoryPort,
} from 'src/auth/domain/ports/outbound/persistence';
import { VerifyUserRegistrationCommand } from 'src/auth/domain/ports/inbound/commands/verify-user-registration.command';
import { User, Otp } from 'src/auth/domain/entities';
import { OtpPurpose, OtpChannel } from 'src/auth/domain/enums';
import { OtpCodeVo } from 'src/auth/domain/value-objects/otp-code.vo';
import { EmailVo } from 'src/shared/domain/value-objects';
import { UserId } from 'src/shared/domain/types';
import {
  UserNotFoundException,
  OtpNotFoundException,
  OtpExpiredException,
  OtpAlreadyUsedException,
  InvalidOtpPurposeException,
} from 'src/auth/domain/exceptions';

describe('VerifyUserRegistrationUseCase', () => {
  let useCase: VerifyUserRegistrationUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let otpRepository: jest.Mocked<OtpRepositoryPort>;

  const mockUserId = 'user-123' as UserId;

  let mockUser: User;
  let mockOtp: Otp;
  let validCommand: VerifyUserRegistrationCommand;

  const createMockUser = () =>
    User.create({
      id: mockUserId,
      email: 'test@example.com',
      password: 'ValidPass123!',
      firstName: 'John',
      lastName: 'Doe',
    });

  const createMockOtp = (overrides?: any) =>
    Otp.create({
      id: 'otp-123',
      userId: mockUserId,
      code: OtpCodeVo.of('123456'),
      channel: OtpChannel.EMAIL,
      purpose: OtpPurpose.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      ...overrides,
    });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyUserRegistrationUseCase,
        {
          provide: UserRepositoryPort,
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: OtpRepositoryPort,
          useValue: {
            findByUserIdAndCode: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<VerifyUserRegistrationUseCase>(
      VerifyUserRegistrationUseCase,
    );
    userRepository = module.get(UserRepositoryPort);
    otpRepository = module.get(OtpRepositoryPort);

    mockUser = createMockUser();
    mockOtp = createMockOtp();
    validCommand = {
      email: EmailVo.of('test@example.com'),
      otpCode: OtpCodeVo.of('123456'),
    };
  });

  describe('execute', () => {
    it('should verify user registration successfully', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      otpRepository.findByUserIdAndCode.mockResolvedValue(mockOtp);
      userRepository.save.mockResolvedValue();
      otpRepository.save.mockResolvedValue();

      await useCase.execute(validCommand);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(otpRepository.findByUserIdAndCode).toHaveBeenCalledWith(
        mockUserId,
        '123456',
      );
      expect(otpRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          usedAt: expect.any(Date),
        }),
      );
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          verifiedAt: expect.any(Date),
        }),
      );
    });

    it('should throw UserNotFoundException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(otpRepository.findByUserIdAndCode).not.toHaveBeenCalled();
    });

    it('should throw OtpNotFoundException when OTP not found', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      otpRepository.findByUserIdAndCode.mockResolvedValue(null);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        OtpNotFoundException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw OtpExpiredException when OTP is expired', async () => {
      const expiredOtp = Otp.reconstitute({
        id: 'otp-expired',
        userId: mockUserId,
        code: OtpCodeVo.of('123456'),
        channel: OtpChannel.EMAIL,
        purpose: OtpPurpose.EMAIL_VERIFICATION,
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        revokedAt: null,
        createdAt: new Date(Date.now() - 10000),
        updatedAt: new Date(Date.now() - 10000),
      });
      userRepository.findByEmail.mockResolvedValue(mockUser);
      otpRepository.findByUserIdAndCode.mockResolvedValue(expiredOtp);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        OtpExpiredException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw OtpAlreadyUsedException when OTP is already used', async () => {
      const usedOtp = createMockOtp();
      usedOtp.markAsUsedFor(OtpPurpose.EMAIL_VERIFICATION);
      userRepository.findByEmail.mockResolvedValue(mockUser);
      otpRepository.findByUserIdAndCode.mockResolvedValue(usedOtp);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        OtpAlreadyUsedException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidOtpPurposeException when OTP purpose is wrong', async () => {
      const wrongPurposeOtp = Otp.reconstitute({
        id: 'otp-wrong-purpose',
        userId: mockUserId,
        code: OtpCodeVo.of('123456'),
        channel: OtpChannel.EMAIL,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        usedAt: null,
        revokedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userRepository.findByEmail.mockResolvedValue(mockUser);
      otpRepository.findByUserIdAndCode.mockResolvedValue(wrongPurposeOtp);

      await expect(useCase.execute(validCommand)).rejects.toThrow(
        InvalidOtpPurposeException,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
