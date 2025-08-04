import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UUIDPort } from 'src/auth/domain/ports/outbound/security/uuid.port';

@Injectable()
export class CryptoUUIDAdapter implements UUIDPort {
  generate(): string {
    return randomUUID();
  }
}
