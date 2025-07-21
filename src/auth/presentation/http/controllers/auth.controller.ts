import { Body, Controller, Inject, Post } from '@nestjs/common';
import { RegisterUserDto } from '../dtos';
import { RegisterUserPort } from 'src/auth/domain/ports/inbound/register-user.port';
import { RegisterUserMapper } from '../mappers';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(RegisterUserPort)
    private readonly registerUserPort: RegisterUserPort,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto): Promise<void> {
    const command = RegisterUserMapper.toCommand(dto);
    return this.registerUserPort.execute(command);
  }
}
