import { UserId } from 'src/shared/domain/types';
import { OtpCodeVo } from '../value-objects/otp-code.vo';
import { OtpExpiredException } from '../exceptions/otp-expired.exception';
import { CreateOtpDto } from '../dtos/create-otp.dto';
import { OtpChannel, OtpPurpose } from '../enums';
import { Entity } from 'src/shared/domain/entities/entity';

interface OtpProps {
  id: string;
  userId: UserId;
  code: OtpCodeVo;
  channel: OtpChannel;
  purpose: OtpPurpose;
  usedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Otp extends Entity<OtpProps> {
  private constructor(props: OtpProps) {
    super(props, props.id);
  }

  static create({
    id,
    userId,
    code,
    expiresAt,
    channel,
    purpose,
  }: CreateOtpDto): Otp {
    const createdAt = new Date();

    if (expiresAt <= createdAt) {
      throw new OtpExpiredException('Expiration date must be in the future');
    }

    return new Otp({
      id,
      userId,
      code,
      channel,
      purpose,
      usedAt: null,
      expiresAt,
      createdAt,
      updatedAt: createdAt,
    });
  }

  static reconstitute(props: OtpProps): Otp {
    return new Otp(props);
  }

  get userId() {
    return this.props.userId;
  }

  get code() {
    return this.props.code;
  }

  get channel() {
    return this.props.channel;
  }

  get purpose() {
    return this.props.purpose;
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
