import { InvalidNameException } from 'src/shared/domain/exceptions/invalid-name.exception';
import { NameVo } from 'src/shared/domain/value-objects';

describe('NameVo', () => {
  it('should create a valid NameVo', () => {
    const name = 'John Doe';
    const vo = NameVo.of(name);
    expect(vo.getValue()).toBe(name);
  });

  it('should trim the name', () => {
    const name = '  John Doe  ';
    const vo = NameVo.of(name);
    expect(vo.getValue()).toBe('John Doe');
  });

  it('should throw InvalidNameException for too short name', () => {
    expect(() => NameVo.of('J')).toThrow(InvalidNameException);
  });

  it('should throw InvalidNameException for too long name', () => {
    const longName = 'A'.repeat(101);
    expect(() => NameVo.of(longName)).toThrow(InvalidNameException);
  });

  it('should throw InvalidNameException for invalid characters', () => {
    expect(() => NameVo.of('John123')).toThrow(InvalidNameException);
    expect(() => NameVo.of('John_Doe')).toThrow(InvalidNameException);
  });
});
