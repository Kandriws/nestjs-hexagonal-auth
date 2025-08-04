import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import {
  RegisterUserDto,
  MessageResponseDto,
  VerifyUserRegistrationDto,
} from '../dtos';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import { RegisterUserMapper, VerifyUserRegistrationMapper } from '../mappers';
import { BaseResponse, ResponseFactory } from 'src/shared/infrastructure/dto';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';
import { VerifyUserRegistrationPort } from 'src/auth/domain/ports/inbound';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserPort)
    private readonly registerUserPort: RegisterUserPort,
    @Inject(VerifyUserRegistrationPort)
    private readonly verifyUserRegistrationPort: VerifyUserRegistrationPort,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<BaseResponse<MessageResponseDto>> {
    const command = RegisterUserMapper.toCommand(dto);
    await this.registerUserPort.execute(command);
    return ResponseFactory.created<MessageResponseDto>({
      message: 'User registered successfully',
    });
  }

  @Post('verify-registration')
  @HttpCode(HttpStatus.OK)
  async verifyRegistration(
    @Body() dto: VerifyUserRegistrationDto,
  ): Promise<BaseResponse<MessageResponseDto>> {
    const command = VerifyUserRegistrationMapper.toCommand(dto);
    await this.verifyUserRegistrationPort.execute(command);
    return ResponseFactory.ok<MessageResponseDto>({
      message: 'User registration verified successfully',
    });
  }
}
