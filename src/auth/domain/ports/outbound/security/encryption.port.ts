import {
  DecryptionResult,
  EncryptionResult,
  SecretMetadata,
} from 'src/auth/domain/types/encryption.type';

export const EncryptionPort = Symbol('EncryptionPort');

export interface EncryptionPort {
  encrypt(plaintext: string): Promise<EncryptionResult>;
  decrypt(
    ciphertext: string,
    metadata: SecretMetadata,
  ): Promise<DecryptionResult>;
}
