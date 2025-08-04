import { InvalidEmailException } from '../exceptions';
import { Email } from '../types';

export class EmailVo {
  private static readonly REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly value: Email) {}

  static of(value: string): EmailVo {
    const trimmed = value.trim().toLowerCase();
    if (!EmailVo.REGEX.test(trimmed)) {
      throw new InvalidEmailException(trimmed);
    }
    return new EmailVo(trimmed as Email);
  }

  equals(other: EmailVo): boolean {
    return this.value === other.value;
  }

  getValue(): Email {
    return this.value;
  }
}
