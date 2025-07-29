import { UserId } from 'src/shared/domain/types';
import { OtpCodeVo } from '../value-objects/otp-code.vo';
import { OtpExpiredException } from '../exceptions/otp-expired.exception';
import { CreateOtpDto } from '../dtos/create-otp.dto';

interface OtpProps {
  id: string;
  userId: UserId;
  code: OtpCodeVo;
  usedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Otp {
  private constructor(private readonly props: OtpProps) {}

  static create({ id, userId, code, expiresAt }: CreateOtpDto): Otp {
    const createdAt = new Date();

    if (expiresAt <= createdAt) {
      throw new OtpExpiredException('Expiration date must be in the future');
    }

    return new Otp({
      id,
      userId,
      code,
      usedAt: null,
      createdAt,
      updatedAt: createdAt,
      expiresAt,
    });
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get code() {
    return this.props.code;
  }

  get usedAt() {
    return this.props.usedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get expiresAt() {
    return this.props.expiresAt;
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }

  markAsUsed(): Otp {
    return new Otp({
      ...this.props,
      usedAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
