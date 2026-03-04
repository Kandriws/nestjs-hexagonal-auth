import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/presentation/http/controllers/auth.controller';
import {
  RegisterUserPort,
  VerifyUserRegistrationPort,
  ResendRegistrationOtpPort,
  LoginUserPort,
  RefreshTokenPort,
  EnableTwoFactorPort,
  VerifyTwoFactorPort,
  ForgotPasswordPort,
  ResetPasswordPort,
  LogoutUserPort,
} from 'src/auth/domain/ports/inbound';
import { GetCurrentUserPort } from 'src/auth/domain/ports/inbound/get-current-user.port';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUser: jest.Mocked<RegisterUserPort>;
  let loginUser: jest.Mocked<LoginUserPort>;
  let verifyRegistration: jest.Mocked<VerifyUserRegistrationPort>;
  let forgotPassword: jest.Mocked<ForgotPasswordPort>;
  let resetPassword: jest.Mocked<ResetPasswordPort>;
  let resendOtp: jest.Mocked<ResendRegistrationOtpPort>;
  let logoutUser: jest.Mocked<LogoutUserPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUserPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: VerifyUserRegistrationPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ResendRegistrationOtpPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: LoginUserPort,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
            }),
          },
        },
        {
          provide: RefreshTokenPort,
          useValue: {
            execute: jest.fn().mockResolvedValue({
              accessToken: 'new-access-token',
              refreshToken: 'new-refresh-token',
            }),
          },
        },
        {
          provide: EnableTwoFactorPort,
          useValue: { execute: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: VerifyTwoFactorPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ForgotPasswordPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ResetPasswordPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: GetCurrentUserPort,
          useValue: { execute: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: LogoutUserPort,
          useValue: { execute: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUser = module.get(RegisterUserPort);
    loginUser = module.get(LoginUserPort);
    verifyRegistration = module.get(VerifyUserRegistrationPort);
    forgotPassword = module.get(ForgotPasswordPort);
    resetPassword = module.get(ResetPasswordPort);
    resendOtp = module.get(ResendRegistrationOtpPort);
    logoutUser = module.get(LogoutUserPort);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should delegate to RegisterUserPort and return created response', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'P@ssw0rd1!',
        confirmPassword: 'P@ssw0rd1!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await controller.register(dto);

      expect(registerUser.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.message).toContain('registered');
    });
  });

  describe('POST /auth/login', () => {
    it('should delegate to LoginUserPort and return tokens', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'P@ssw0rd1!',
        otpCode: '',
      };
      const requestContext = {
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test',
      };

      const result = await controller.login(dto, requestContext);

      expect(loginUser.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('accessToken');
      expect(result.data).toHaveProperty('refreshToken');
    });
  });

  describe('POST /auth/verify-registration', () => {
    it('should delegate to VerifyUserRegistrationPort', async () => {
      const dto = { email: 'test@example.com', otpCode: '123456' };

      const result = await controller.verifyRegistration(dto);

      expect(verifyRegistration.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.message).toContain('verified');
    });
  });

  describe('POST /auth/resend-registration-otp', () => {
    it('should delegate to ResendRegistrationOtpPort', async () => {
      const dto = { email: 'test@example.com' };

      const result = await controller.resendRegistrationOtp(dto);

      expect(resendOtp.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should delegate to ForgotPasswordPort', async () => {
      const dto = { email: 'test@example.com' };
      const requestContext = {
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test',
      };

      const result = await controller.forgotPassword(dto, requestContext);

      expect(forgotPassword.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should delegate to ResetPasswordPort', async () => {
      const dto = {
        token: 'reset-token-123',
        newPassword: 'NewP@ssw0rd1!',
        confirmPassword: 'NewP@ssw0rd1!',
      };

      const result = await controller.resetPassword(dto);

      expect(resetPassword.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.message).toContain('reset');
    });
  });

  describe('POST /auth/logout', () => {
    it('should delegate to LogoutUserPort', async () => {
      const dto = { refreshToken: 'some-refresh-token' };

      const result = await controller.logout(dto);

      expect(logoutUser.execute).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Logged out');
    });
  });
});
