import { AccessControlGuard } from 'src/auth/infrastructure/guards';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { TokenPayloadVo } from 'src/auth/domain/value-objects';
import { EmailVo } from 'src/shared/domain/value-objects';
import { UserId } from 'src/shared/domain/types';
import { ROLES_KEY } from 'src/auth/infrastructure/decorators/roles.decorator';
import { PERMISSIONS_KEY } from 'src/auth/infrastructure/decorators/permissions.decorator';

// Helper to build a TokenPayloadVo quickly
function asUserId(id: string): UserId {
  return id as UserId;
}

interface OverridePayload {
  roles?: { name: string; realm: string }[];
  permissions?: { name: string; realm: string }[];
}

function buildTokenPayload(
  overrides: OverridePayload = {},
): Readonly<TokenPayloadVo> {
  const baseDate = new Date('2030-01-01T00:00:00.000Z');
  return TokenPayloadVo.of({
    userId: asUserId('user-1'),
    email: EmailVo.of('user@example.com'),
    expiresAt: new Date(baseDate.getTime() + 60_000),
    issuedAt: new Date(baseDate.getTime() - 1_000),
    roles: overrides.roles ?? [{ name: 'admin', realm: 'global' }],
    permissions: overrides.permissions ?? [
      { name: 'roles.manage', realm: 'global' },
    ],
  });
}

describe('AccessControlGuard', () => {
  let reflector: Reflector;
  let guard: AccessControlGuard;

  const makeContext = (user: any): ExecutionContext => {
    return {
      getHandler: () => ({}) as any,
      getClass: () => ({}) as any,
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      // unused methods mocked
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({}) as any,
      switchToWs: () => ({}) as any,
      getType: () => 'http',
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new AccessControlGuard(reflector);
  });

  const mockRequired = (
    roles?: string[] | undefined | null,
    permissions?: string[] | undefined | null,
  ) => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation(
      (key: string) => {
        if (key === ROLES_KEY)
          return roles ?? (roles === null ? null : undefined);
        if (key === PERMISSIONS_KEY)
          return permissions ?? (permissions === null ? null : undefined);
        return undefined;
      },
    );
  };

  it('allows when no roles/permissions metadata', () => {
    mockRequired(undefined, undefined);
    const ctx = makeContext(buildTokenPayload());
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when user missing and metadata present', () => {
    mockRequired(['admin'], undefined);
    const ctx = makeContext(undefined);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows when user has required role (TokenPayloadVo)', () => {
    mockRequired(['admin'], undefined);
    const user = buildTokenPayload();
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows when user has required permission (plain object)', () => {
    mockRequired(undefined, ['roles.manage']);
    const user = {
      permissions: [{ name: 'roles.manage', realm: 'global' }],
    };
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when user lacks required access (role and permission mismatch)', () => {
    mockRequired(['admin'], ['roles.manage']);
    const user = buildTokenPayload({
      roles: [{ name: 'user', realm: 'global' }],
      permissions: [],
    });
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows when any one of multiple required roles matches (some logic)', () => {
    mockRequired(['manager', 'auditor', 'admin'], undefined);
    const user = buildTokenPayload({
      roles: [{ name: 'auditor', realm: 'global' }],
    });
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows when any one of multiple required permissions matches', () => {
    mockRequired(undefined, ['users.read', 'roles.manage']);
    const user = buildTokenPayload(); // already has roles.manage
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('returns true if role matches even if permission does not', () => {
    mockRequired(['admin'], ['some.other']);
    const user = buildTokenPayload();
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('returns true if permission matches even if role does not', () => {
    mockRequired(['other'], ['roles.manage']);
    const user = buildTokenPayload();
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('handles roles / permissions provided as string arrays directly', () => {
    mockRequired(['admin'], undefined);
    const user = { roles: ['admin'], permissions: [] };
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('filters out malformed role/permission entries', () => {
    mockRequired(['valid'], ['perm.good']);
    const user = {
      roles: [null, {}, { foo: 'bar' }, { name: 'valid' }],
      permissions: [undefined, { name: 'perm.good' }, { bogus: true }],
    };
    const ctx = makeContext(user);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('returns true when required metadata arrays are empty (treated as no requirement)', () => {
    mockRequired([], []);
    const ctx = makeContext(buildTokenPayload());
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('works when roles metadata empty array and only permission required', () => {
    mockRequired([], ['roles.manage']);
    const ctx = makeContext(buildTokenPayload());
    expect(guard.canActivate(ctx)).toBe(true);
  });

  describe('parametrized role matching', () => {
    test.each([
      { required: ['r1', 'r2'], userRoles: ['r2'], expected: true },
      { required: ['r1', 'r2'], userRoles: ['r3'], expected: false },
      { required: ['only'], userRoles: [], expected: false },
    ])(
      'required=%j userRoles=%j => %s',
      ({ required, userRoles, expected }) => {
        mockRequired(required, undefined);
        const user = buildTokenPayload({
          roles: userRoles.map((r) => ({ name: r, realm: 'global' })),
          permissions: [],
        });
        const ctx = makeContext(user);
        expect(guard.canActivate(ctx)).toBe(expected);
      },
    );
  });
});
