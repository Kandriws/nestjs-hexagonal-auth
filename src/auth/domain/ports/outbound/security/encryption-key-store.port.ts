export const EncryptionKeyStorePort = Symbol('EncryptionKeyStorePort');
export interface EncryptionKeyStorePort {
  get(keyId: string): Buffer | undefined;
  currentKeyId(): string;
}
