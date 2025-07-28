import { MissingAuthTokensException } from 'src/shared/domain/exceptions/missing-auth-tokens.exception';
import { AuthTokensVo } from 'src/shared/domain/value-objects/auth-tokens.vo';

describe('AuthTokensVo', () => {
  it('should create a valid AuthTokensVo', () => {
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    const vo = AuthTokensVo.of(accessToken, refreshToken);
    expect(vo.getAccessToken()).toBe(accessToken);
    expect(vo.getRefreshToken()).toBe(refreshToken);
  });

  it('should throw MissingAuthTokensException if accessToken is missing', () => {
    expect(() => AuthTokensVo.of('', 'refresh-token')).toThrow(
      MissingAuthTokensException,
    );
  });

  it('should throw MissingAuthTokensException if refreshToken is missing', () => {
    expect(() => AuthTokensVo.of('access-token', '')).toThrow(
      MissingAuthTokensException,
    );
  });

  it('should compare equality correctly', () => {
    const vo1 = AuthTokensVo.of('a', 'b');
    const vo2 = AuthTokensVo.of('a', 'b');
    const vo3 = AuthTokensVo.of('a', 'c');
    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
  });
});
