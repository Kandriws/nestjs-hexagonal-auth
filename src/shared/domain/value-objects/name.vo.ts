import { InvalidNameException } from '../exceptions/invalid-name.exception';

export class NameVo {
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 100;

  private constructor(private readonly value: string) {}
  static of(value: string): NameVo {
    const trimmed = value.trim();
    this.validate(trimmed);
    return new NameVo(trimmed);
  }

  getValue(): string {
    return this.value;
  }

  private static validate(value: string): void {
    if (value.length < NameVo.MIN_LENGTH || value.length > NameVo.MAX_LENGTH) {
      throw new InvalidNameException(
        `Name must be between ${NameVo.MIN_LENGTH} and ${NameVo.MAX_LENGTH} characters long`,
      );
    }

    if (!/^[a-zA-Z\s]+$/.test(value)) {
      throw new InvalidNameException(
        'Name can only contain letters and spaces',
      );
    }
  }
}
