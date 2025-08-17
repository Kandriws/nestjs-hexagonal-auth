import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import {
  RegisterUserDto,
  MessageResponseDto,
  VerifyUserRegistrationDto,
  LoginUserDto,
  RefreshTokenDto,
} from '../dtos';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import {
  LoginUserMapper,
  RegisterUserMapper,
  ResendRegistrationOtpMapper,
  VerifyUserRegistrationMapper,
} from '../mappers';
import { ApiResponse, ResponseFactory } from 'src/shared/infrastructure/dto';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import {
  LoginUserPort,
  RefreshTokenPort,
  ResendRegistrationOtpPort,
  VerifyUserRegistrationPort,
} from 'src/auth/domain/ports/inbound';
import { ResendRegistrationOtpDto } from '../dtos/resend-registration-otp.dto';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import {
  RequestContext,
  RequestMetadata,
} from 'src/shared/infrastructure/decorators/request-metadata.decorator';
import { RefreshTokenMapper } from '../mappers/refresh-token.mapper';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserPort)
    private readonly registerUserPort: RegisterUserPort,
    @Inject(VerifyUserRegistrationPort)
    private readonly verifyUserRegistrationPort: VerifyUserRegistrationPort,
    @Inject(ResendRegistrationOtpPort)
    private readonly resendRegistrationOtpPort: ResendRegistrationOtpPort,
    @Inject(LoginUserPort)
    private readonly loginUserPort: LoginUserPort,
    @Inject(RefreshTokenPort)
    private readonly refreshTokenPort: RefreshTokenPort,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = RegisterUserMapper.toCommand(dto);
    await this.registerUserPort.execute(command);
    return ResponseFactory.created<MessageResponseDto>({
      message: 'User registered successfully',
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserDto,
    @RequestMetadata() requestContext: RequestContext,
  ): Promise<ApiResponse<AuthTokensResponse>> {
    const command = LoginUserMapper.toCommand(dto, requestContext);

    const response = await this.loginUserPort.execute(command);
    return ResponseFactory.ok<AuthTokensResponse>({
      data: response,
      message: 'User logged in successfully',
    });
  }

  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  async verifyRegistration(
    @Body() dto: VerifyUserRegistrationDto,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = VerifyUserRegistrationMapper.toCommand(dto);
    await this.verifyUserRegistrationPort.execute(command);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'User registration verified successfully',
    });
  }

  @Post('resend-registration-otp')
  @HttpCode(HttpStatus.OK)
  async resendRegistrationOtp(
    @Body() dto: ResendRegistrationOtpDto,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = ResendRegistrationOtpMapper.toCommand(dto);
    await this.resendRegistrationOtpPort.execute(command.email);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'Registration OTP resent successfully',
    });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @RequestMetadata() requestContext: RequestContext,
  ): Promise<ApiResponse<AuthTokensResponse>> {
    const command = RefreshTokenMapper.toCommand(dto, requestContext);
    const response = await this.refreshTokenPort.execute(command);
    return ResponseFactory.ok<AuthTokensResponse>({
      data: response,
      message: 'Token refreshed successfully',
    });
  }
}
