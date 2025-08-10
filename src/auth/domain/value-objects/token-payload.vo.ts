import { UserId } from 'src/shared/domain/types';
import { EmailVo } from 'src/shared/domain/value-objects';
import { InvalidTokenPayloadException } from '../exceptions';

interface CreateTokenPayloadVoParams {
  userId: UserId;
  email: EmailVo;
  expiresAt: Date;
  issuedAt: Date;
  jti?: string;
}

export class TokenPayloadVo {
  private constructor(
    private readonly _userId: UserId,
    private readonly _email: EmailVo,
    private readonly _expiresAt: Date,
    private readonly _issuedAt: Date,
    private readonly _jti?: string,
  ) {}

  static of(createParams: CreateTokenPayloadVoParams): TokenPayloadVo {
    this.validate(
      createParams.userId,
      createParams.expiresAt,
      createParams.issuedAt,
      createParams.jti,
    );

    return new TokenPayloadVo(
      createParams.userId,
      createParams.email,
      createParams.expiresAt,
      createParams.issuedAt,
      createParams.jti,
    );
  }

  private static validate(
    userId: UserId,
    expiresAt: Date,
    issuedAt: Date,
    jti?: string,
  ): void {
    if (!userId || userId.trim() === '') {
      throw new InvalidTokenPayloadException('User ID cannot be empty');
    }

    if (!expiresAt || !issuedAt) {
      throw new InvalidTokenPayloadException(
        'Dates cannot be null or undefined',
      );
    }

    if (!(expiresAt instanceof Date) || !(issuedAt instanceof Date)) {
      throw new InvalidTokenPayloadException('Invalid date format');
    }

    if (isNaN(expiresAt.getTime()) || isNaN(issuedAt.getTime())) {
      throw new InvalidTokenPayloadException('Invalid date values');
    }

    if (expiresAt <= issuedAt) {
      throw new InvalidTokenPayloadException(
        'Expiration date must be after issued date',
      );
    }

    if (jti !== undefined && jti.trim() === '') {
      throw new InvalidTokenPayloadException('JTI cannot be empty string');
    }
  }

  equals(other: TokenPayloadVo): boolean {
    return (
      other instanceof TokenPayloadVo &&
      this._userId === other._userId &&
      this._email.equals(other._email) &&
      this._expiresAt.getTime() === other._expiresAt.getTime() &&
      this._issuedAt.getTime() === other._issuedAt.getTime() &&
      this._jti === other._jti
    );
  }

  isExpired(currentTime: Date = new Date()): boolean {
    return currentTime >= this._expiresAt;
  }

  isValid(currentTime: Date = new Date()): boolean {
    return !this.isExpired(currentTime) && currentTime >= this._issuedAt;
  }

  getUserId(): UserId {
    return this._userId;
  }

  getEmail(): EmailVo {
    return this._email;
  }

  getExpiresAt(): Date {
    return new Date(this._expiresAt);
  }

  getIssuedAt(): Date {
    return new Date(this._issuedAt);
  }

  getJti(): string | undefined {
    return this._jti;
  }
}
