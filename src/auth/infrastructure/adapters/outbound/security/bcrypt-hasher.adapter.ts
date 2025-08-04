import { HasherPort } from 'src/auth/domain/ports/outbound/security/hasher.port';
import * as bcrypt from 'bcrypt';
import { Inject } from '@nestjs/common';
import securityConfig from 'src/shared/infrastructure/config/security.config';

export class BcryptHasherAdapter implements HasherPort {
  constructor(
    @Inject(securityConfig.KEY)
    private readonly config: ReturnType<typeof securityConfig>,
  ) {}

  async hash(value: string): Promise<string> {
    return await bcrypt.hash(value, this.config.saltRounds);
  }

  async compare(value: string, hashedValue: string): Promise<boolean> {
    return await bcrypt.compare(value, hashedValue);
  }
}
