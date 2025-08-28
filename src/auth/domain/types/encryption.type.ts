/**
 * Metadata describing an encrypted secret.
 *
 * Provides identifying and cryptographic details required to locate, decrypt,
 * and validate a secret value. Implementations may include additional
 * provider- or application-specific fields beyond those listed here.
 *
 * @property keyId - Identifier of the key used to encrypt the secret (e.g., KMS key ARN or UUID).
 * @property alg - The cryptographic algorithm or scheme used (e.g., "AES-GCM", "RSA-OAEP").
 * @property v - Version number of the secret metadata schema or of the secret key material.
 * @property createdAt - Creation timestamp in ISO 8601 format (e.g., "2023-01-01T12:00:00Z").
 * @property iv - Optional initialization vector (IV) used for symmetric encryption (typically base64-encoded).
 * @property tag - Optional authentication tag produced by an AEAD cipher (typically base64-encoded).
 * @property aad - Optional additional authenticated data associated with the ciphertext (typically base64 or UTF-8).
 * @property format - Optional hint for the plaintext format (e.g., "utf8", "json", "binary").
 * @property provider - Optional name of the key/provider service that managed the encryption (e.g., "aws-kms", "vault").
 * @remarks
 * - The index signature ([k: string]: any) allows storing arbitrary extra metadata entries.
 * - Consumers should treat cryptographic fields (iv, tag, aad) as opaque strings and follow provider-specific encoding expectations.
 */
export interface SecretMetadata {
  keyId: string;
  alg: string;
  v: number;
  createdAt: string;
  iv?: string;
  tag?: string;
  aad?: string;
  format?: string;
  provider?: string;
  [k: string]: any;
}

export interface EncryptionResult {
  ciphertext: string;
  metadata: SecretMetadata;
}

export interface DecryptionResult {
  plaintext: string;
}
