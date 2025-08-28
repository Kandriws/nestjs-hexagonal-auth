import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import {
  EncryptionKeyNotFoundException,
  InvalidEncryptionKeyException,
} from 'src/auth/domain/exceptions';
import {
  EncryptionKeyStorePort,
  EncryptionPort,
} from 'src/auth/domain/ports/outbound/security';
import {
  DecryptionResult,
  EncryptionResult,
  SecretMetadata,
} from 'src/auth/domain/types/encryption.type';

@Injectable()
export class AesGcmEncryptionAdapter implements EncryptionPort {
  constructor(
    @Inject(EncryptionKeyStorePort)
    private readonly keyStore: EncryptionKeyStorePort,
  ) {}

  async encrypt(plaintext: string): Promise<EncryptionResult> {
    const keyId = this.keyStore.currentKeyId();
    const rawKey = this.normalizeKey(this.keyStore.get(keyId), keyId);

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', rawKey, iv);
    const ct = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    return {
      ciphertext: ct.toString('base64'),
      metadata: {
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        keyId: keyId,
        alg: 'AES-256-GCM',
        v: 1,
        provider: 'local',
        createdAt: new Date().toISOString(),
      },
    };
  }

  async decrypt(
    ciphertext: string,
    metadata: SecretMetadata,
  ): Promise<DecryptionResult> {
    const rawKey = this.normalizeKey(
      this.keyStore.get(metadata.keyId),
      metadata.keyId,
    );

    const iv = Buffer.from(metadata.iv, 'base64');
    const tag = Buffer.from(metadata.tag, 'base64');
    const ct = Buffer.from(ciphertext, 'base64');

    const dec = createDecipheriv('aes-256-gcm', rawKey, iv);
    dec.setAuthTag(tag);
    const plain = Buffer.concat([dec.update(ct), dec.final()]).toString('utf8');

    return { plaintext: plain };
  }

  private normalizeKey(
    key: Buffer | string | Uint8Array | undefined,
    keyId?: string,
  ): Buffer {
    if (!key) {
      throw new EncryptionKeyNotFoundException(
        `Key not found${keyId ? `: ${keyId}` : ''}`,
      );
    }

    if (Buffer.isBuffer(key)) {
      if (key.length === 32) return key;
      throw new InvalidEncryptionKeyException(
        `Invalid key length: ${key.length} bytes (expected 32 bytes for AES-256-GCM)${keyId ? ` for keyId ${keyId}` : ''}`,
      );
    }

    if (key instanceof Uint8Array) {
      const buf = Buffer.from(key);
      if (buf.length === 32) return buf;
      throw new InvalidEncryptionKeyException(
        `Invalid key length: ${buf.length} bytes (expected 32 bytes for AES-256-GCM)${keyId ? ` for keyId ${keyId}` : ''}`,
      );
    }

    if (typeof key === 'string') {
      const tryBuffers: Buffer[] = [
        Buffer.from(key, 'base64'),
        Buffer.from(key, 'hex'),
        Buffer.from(key, 'utf8'),
      ];

      for (const buf of tryBuffers) {
        if (buf.length === 32) return buf;
      }

      const lengths = tryBuffers.map((b) => b.length).join(', ');
      throw new InvalidEncryptionKeyException(
        `Invalid key string length variants: [${lengths}] (expected 32 bytes for AES-256-GCM)${keyId ? ` for keyId ${keyId}` : ''}`,
      );
    }

    throw new InvalidEncryptionKeyException(
      `Unsupported key type${keyId ? ` for keyId ${keyId}` : ''}`,
    );
  }
}
