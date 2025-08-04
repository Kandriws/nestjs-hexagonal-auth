import { InvalidOtpCodeException } from '../exceptions';
import { OtpCode } from '../types';

export class OtpCodeVo {
  constructor(private readonly value: OtpCode) {}

  static of(value: string): OtpCodeVo {
    this.validate(value);
    return new OtpCodeVo(value as OtpCode);
  }

  private static validate(value: string): void {
    if (!/^[a-zA-Z0-9]{6}$/.test(value)) {
      throw new InvalidOtpCodeException(
        'OTP code must be a 6-character string (letters, numbers, or both)',
      );
    }
  }

  equals(other: OtpCodeVo): boolean {
    return this.value === other.value;
  }

  getValue(): OtpCode {
    return this.value;
  }
}
