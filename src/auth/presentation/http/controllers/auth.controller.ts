import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiExtraModels,
  ApiBearerAuth,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  SwaggerMessageResponseDto,
  SwaggerAuthTokensResponseDto,
  SwaggerEnableTwoFactorResponseDto,
} from 'src/shared/infrastructure/dto/swagger-api-response.dto';
import { SwaggerErrorResponseDto } from 'src/shared/infrastructure/dto/swagger-error-response.dto';
import {
  RegisterUserDto,
  MessageResponseDto,
  VerifyUserRegistrationDto,
  LoginUserDto,
  RefreshTokenDto,
  VerifyTwoFactorDto,
  ForgotPasswordDto,
} from '../dtos';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import {
  EnableTwoFactorMapper,
  ForgotPasswordMapper,
  LoginUserMapper,
  RefreshTokenMapper,
  RegisterUserMapper,
  ResendRegistrationOtpMapper,
  VerifyTwoFactorMapper,
  VerifyUserRegistrationMapper,
} from '../mappers';
import { ApiResponse, ResponseFactory } from 'src/shared/infrastructure/dto';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import {
  EnableTwoFactorPort,
  ForgotPasswordPort,
  LoginUserPort,
  RefreshTokenPort,
  ResendRegistrationOtpPort,
  ResetPasswordPort,
  VerifyTwoFactorPort,
  VerifyUserRegistrationPort,
} from 'src/auth/domain/ports/inbound';
import { ResendRegistrationOtpDto } from '../dtos/resend-registration-otp.dto';
import { AuthTokensResponse } from 'src/auth/domain/ports/inbound/commands/auth-tokens-response';
import {
  RequestContext,
  RequestMetadata,
} from 'src/shared/infrastructure/decorators/request-metadata.decorator';
import { EnableTwoFactorDto } from '../dtos/enable-two-factor.dto';
import { EnableTwoFactorResponse } from 'src/auth/domain/ports/outbound/commands/enable-two-factor-response';
import { Public } from 'src/auth/infrastructure/decorators/public.decorator';
import { CurrentUser } from 'src/auth/infrastructure/decorators/current-user.decorator';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { ResetPasswordMapper } from '../mappers/reset-password.mapper';

@ApiTags('Auth')
@ApiExtraModels(
  SwaggerMessageResponseDto,
  SwaggerAuthTokensResponseDto,
  SwaggerEnableTwoFactorResponseDto,
  SwaggerErrorResponseDto,
)
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
    @Inject(EnableTwoFactorPort)
    private readonly enableTwoFactorPort: EnableTwoFactorPort,
    @Inject(VerifyTwoFactorPort)
    private readonly verifyTwoFactorPort: VerifyTwoFactorPort,
    @Inject(ForgotPasswordPort)
    private readonly forgotPasswordPort: ForgotPasswordPort,
    @Inject(ResetPasswordPort)
    private readonly resetPasswordPort: ResetPasswordPort,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user', operationId: 'registerUser' })
  @SwaggerResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    schema: { $ref: getSchemaPath(SwaggerMessageResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = RegisterUserMapper.toCommand(dto);
    await this.registerUserPort.execute(command);
    return ResponseFactory.created<MessageResponseDto>({
      message: 'User registered successfully',
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user', operationId: 'loginUser' })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    schema: { $ref: getSchemaPath(SwaggerAuthTokensResponseDto) },
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
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

  @Public()
  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Verify a user's registration using OTP",
    operationId: 'verifyRegistration',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'User registration verified successfully',
    schema: { $ref: getSchemaPath(SwaggerMessageResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  async verifyRegistration(
    @Body() dto: VerifyUserRegistrationDto,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = VerifyUserRegistrationMapper.toCommand(dto);
    await this.verifyUserRegistrationPort.execute(command);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'User registration verified successfully',
    });
  }

  @Public()
  @Post('resend-registration-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Resend registration OTP to email',
    operationId: 'resendRegistrationOtp',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Registration OTP resent successfully',
    schema: { $ref: getSchemaPath(SwaggerMessageResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
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
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh authentication tokens',
    operationId: 'refreshToken',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    schema: { $ref: getSchemaPath(SwaggerAuthTokensResponseDto) },
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
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

  @Post('enable-two-factor')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enable two-factor authentication for current user',
    operationId: 'enableTwoFactor',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Two-factor authentication setup successfully',
    schema: { $ref: getSchemaPath(SwaggerEnableTwoFactorResponseDto) },
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  async enableTwoFactor(
    @Body() dto: EnableTwoFactorDto,
    @CurrentUser() currentUser: TokenPayloadVo,
  ): Promise<ApiResponse<EnableTwoFactorResponse>> {
    dto.userId = currentUser.getUserId();
    const command = EnableTwoFactorMapper.toCommand(dto);
    const response = await this.enableTwoFactorPort.execute(
      command.userId,
      command.method,
    );
    return ResponseFactory.ok<EnableTwoFactorResponse>({
      message:
        'Two-factor authentication setup successfully, please send the verification code to verify',
      data: response,
    });
  }

  @Post('verify-two-factor')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify two-factor authentication code',
    operationId: 'verifyTwoFactor',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Two-factor authentication verified successfully',
    schema: { $ref: getSchemaPath(SwaggerMessageResponseDto) },
  })
  @SwaggerResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  async verifyTwoFactor(
    @Body() dto: VerifyTwoFactorDto,
    @CurrentUser() currentUser: TokenPayloadVo,
  ): Promise<ApiResponse<MessageResponseDto>> {
    dto.userId = currentUser.getUserId();
    const command = VerifyTwoFactorMapper.toCommand(dto);
    await this.verifyTwoFactorPort.execute(command);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'Two-factor authentication verified successfully',
    });
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request password reset email',
    operationId: 'forgotPassword',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Password reset email sent successfully',
    schema: { $ref: getSchemaPath(SwaggerMessageResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @RequestMetadata() requestContext: RequestContext,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = ForgotPasswordMapper.toCommand(dto, requestContext);
    await this.forgotPasswordPort.execute(command);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'Password reset email sent successfully',
    });
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset user password using token',
    operationId: 'resetPassword',
  })
  @SwaggerResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    schema: { $ref: getSchemaPath(SwaggerMessageResponseDto) },
  })
  @SwaggerResponse({
    status: 400,
    description: 'Bad Request',
    schema: { $ref: getSchemaPath(SwaggerErrorResponseDto) },
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<ApiResponse<MessageResponseDto>> {
    const command = ResetPasswordMapper.toCommand(dto);
    await this.resetPasswordPort.execute(command);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'Password reset successfully',
    });
  }
}
