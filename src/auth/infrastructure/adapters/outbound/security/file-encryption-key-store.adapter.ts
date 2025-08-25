import { Inject, Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { EncryptionKeyStorePort } from 'src/auth/domain/ports/outbound/security';
import securityConfig from 'src/shared/infrastructure/config/security.config';

@Injectable()
export class FileEncryptionKeyStoreAdapter implements EncryptionKeyStorePort {
  private readonly keys = new Map<string, Buffer>();
  private readonly current: string;

  constructor(
    @Inject(securityConfig.KEY)
    private readonly config: ReturnType<typeof securityConfig>,
  ) {
    const path = this.config.encryption.keysFilePath;
    const raw = readFileSync(path, { encoding: 'utf-8' });
    const parsed = JSON.parse(raw);

    for (const [kid, b64] of Object.entries(parsed)) {
      if (kid === 'current') continue;
      this.keys.set(kid, Buffer.from(b64 as string, 'base64'));
    }

    this.current = parsed.current as string;
  }

  get(keyId: string): Buffer | undefined {
    return this.keys.get(keyId);
  }

  currentKeyId(): string {
    return this.current;
  }
}
