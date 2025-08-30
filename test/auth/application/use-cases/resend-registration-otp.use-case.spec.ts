import { Test, TestingModule } from '@nestjs/testing';
import { ResendRegistrationOtpUseCase } from 'src/auth/application/use-cases/resend-registration-otp.use-case';
import { UserRepositoryPort } from 'src/auth/domain/ports/outbound/persistence';
import { OtpSenderPort } from 'src/auth/domain/ports/outbound/security';
import { EmailVo } from 'src/shared/domain/value-objects';
import { createMockUser } from '../../../shared/test-helpers';
import {
  UserNotFoundException,
  UserAlreadyVerifiedException,
} from 'src/auth/domain/exceptions';

describe('ResendRegistrationOtpUseCase', () => {
  let useCase: ResendRegistrationOtpUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let otpSender: jest.Mocked<OtpSenderPort>;

  const email = EmailVo.of('a@b.com');
  const user = createMockUser({ email: 'a@b.com' });
  // ensure user is explicitly unverified in the snapshot used by User.isVerified()
  (user as any).snap.verifiedAt = null;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendRegistrationOtpUseCase,
        {
          provide: UserRepositoryPort,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: OtpSenderPort,
          useValue: { sendOtp: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get(ResendRegistrationOtpUseCase);
    userRepository = module.get(UserRepositoryPort);
    otpSender = module.get(OtpSenderPort);
  });

  it('sends otp when user exists and not verified', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    otpSender.sendOtp.mockResolvedValue(undefined);

    await useCase.execute(email);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(email.getValue());
    expect(otpSender.sendOtp).toHaveBeenCalledWith(
      expect.objectContaining({ userId: user.id }),
    );
  });

  it('throws UserNotFoundException when user missing', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    await expect(useCase.execute(email)).rejects.toThrow(UserNotFoundException);
  });

  it('throws UserAlreadyVerifiedException when user is verified', async () => {
    user.markAsVerified();
    userRepository.findByEmail.mockResolvedValue(user);
    await expect(useCase.execute(email)).rejects.toThrow(
      UserAlreadyVerifiedException,
    );
  });
});
