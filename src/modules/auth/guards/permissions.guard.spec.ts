import 'reflect-metadata';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import {
  Permissions,
  PERMISSIONS_MODE_KEY,
} from '@common/decorators/permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { SetMetadata } from '@nestjs/common';

@Permissions('class:read')
@SetMetadata(PERMISSIONS_MODE_KEY, 'all')
class ClassLevel {
  inherits() {}

  @Permissions('x:read', 'y:read')
  @SetMetadata(PERMISSIONS_MODE_KEY, 'any')
  overrides() {}
}

class Plain {
  @Permissions('a:read', 'b:read')
  anyMode() {}

  @Permissions('a:read', 'b:read')
  @SetMetadata(PERMISSIONS_MODE_KEY, 'all')
  allMode() {}

  open() {}
}

const ctx = (
  cls: new () => object,
  method: string,
  user?: { id?: number; permissions?: unknown },
) =>
  ({
    getHandler: () => (cls.prototype as Record<string, () => void>)[method],
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  const guard = new PermissionsGuard(new Reflector());

  beforeEach(() => jest.clearAllMocks());

  it('permite si no hay metadata', () => {
    expect(guard.canActivate(ctx(Plain, 'open', undefined))).toBe(true);
  });

  it('modo any (default): basta un permiso', () => {
    const user = { id: 1, permissions: ['b:read'] };
    expect(guard.canActivate(ctx(Plain, 'anyMode', user))).toBe(true);
  });

  it('modo any: rechaza sin ninguno', () => {
    const user = { id: 1, permissions: ['z:read'] };
    expect(() => guard.canActivate(ctx(Plain, 'anyMode', user))).toThrow(
      new ForbiddenException('Permisos insuficientes.'),
    );
  });

  it('modo all: exige todos', () => {
    expect(() =>
      guard.canActivate(ctx(Plain, 'allMode', { permissions: ['a:read'] })),
    ).toThrow(ForbiddenException);
    expect(
      guard.canActivate(
        ctx(Plain, 'allMode', { permissions: ['a:read', 'b:read'] }),
      ),
    ).toBe(true);
  });

  it('superusuario admin:all pasa directo', () => {
    const user = { id: 9, permissions: [PERMISSIONS.ADMIN.ALL] };
    expect(guard.canActivate(ctx(Plain, 'allMode', user))).toBe(true);
  });

  it('metadata a nivel clase aplica a handlers sin metadata propia', () => {
    expect(
      guard.canActivate(
        ctx(ClassLevel, 'inherits', { permissions: ['class:read'] }),
      ),
    ).toBe(true);
    expect(() =>
      guard.canActivate(ctx(ClassLevel, 'inherits', { permissions: [] })),
    ).toThrow(ForbiddenException);
  });

  it('metadata de handler gana sobre la de clase', () => {
    expect(
      guard.canActivate(
        ctx(ClassLevel, 'overrides', { permissions: ['x:read'] }),
      ),
    ).toBe(true);
  });

  it('sin user o sin permisos array: 403 y warn con userId', () => {
    const warn = jest
      .spyOn(
        (guard as unknown as { logger: { warn: (m: string) => void } }).logger,
        'warn',
      )
      .mockImplementation();
    expect(() => guard.canActivate(ctx(Plain, 'anyMode', undefined))).toThrow(
      ForbiddenException,
    );
    expect(() =>
      guard.canActivate(ctx(Plain, 'anyMode', { id: 5, permissions: 'x' })),
    ).toThrow(ForbiddenException);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[1][0]).toContain('userId=5');
    expect(warn.mock.calls[1][0]).toContain('a:read,b:read');
  });
});
