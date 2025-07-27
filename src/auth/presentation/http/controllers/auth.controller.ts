import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { RegisterUserDto, RegisterUserResponseDto } from '../dtos';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import { RegisterUserMapper } from '../mappers';
import { BaseResponse, ResponseFactory } from 'src/shared/infrastructure/dto';
import { HttpStatus } from 'src/shared/domain/enums/http-status.enum';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserPort)
    private readonly registerUserPort: RegisterUserPort,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterUserDto,
  ): Promise<BaseResponse<RegisterUserResponseDto>> {
    const command = RegisterUserMapper.toCommand(dto);
    await this.registerUserPort.execute(command);
    return ResponseFactory.created<RegisterUserResponseDto>({
      message: 'User registered successfully',
    });
  }
}
