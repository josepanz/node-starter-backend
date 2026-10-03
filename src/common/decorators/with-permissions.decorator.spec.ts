import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { PERMISSIONS_KEY, PERMISSIONS_MODE_KEY } from './permissions.decorator';
import { WithPermissions } from './with-permissions.decorator';

class Sample {
  @WithPermissions(['a:read', 'b:read'])
  any() {}

  @WithPermissions(['a:read', 'b:read'], { mode: 'all' })
  all() {}
}

const ctxFor = (handler: () => void, permissions: string[]) =>
  ({
    getHandler: () => handler,
    getClass: () => Sample,
    switchToHttp: () => ({ getRequest: () => ({ user: { permissions } }) }),
  }) as unknown as ExecutionContext;

describe('WithPermissions', () => {
  const guard = new PermissionsGuard(new Reflector());
  const handlerOf = (name: 'all' | 'any') =>
    Object.getOwnPropertyDescriptor(Sample.prototype, name)!
      .value as () => void;

  it('registra JwtAuthGuard + PermissionsGuard y la metadata de permisos', () => {
    const handler = handlerOf('any');
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
      JwtAuthGuard,
      PermissionsGuard,
    ]);
    expect(Reflect.getMetadata(PERMISSIONS_KEY, handler)).toEqual([
      'a:read',
      'b:read',
    ]);
    expect(Reflect.getMetadata(PERMISSIONS_MODE_KEY, handler)).toBe('any');
  });

  it('el default es any y all es opt-in', () => {
    expect(Reflect.getMetadata(PERMISSIONS_MODE_KEY, handlerOf('any'))).toBe(
      'any',
    );
    expect(Reflect.getMetadata(PERMISSIONS_MODE_KEY, handlerOf('all'))).toBe(
      'all',
    );
  });

  it('modo all exige todos los permisos', () => {
    expect(() =>
      guard.canActivate(ctxFor(handlerOf('all'), ['a:read'])),
    ).toThrow(ForbiddenException);
    expect(
      guard.canActivate(ctxFor(handlerOf('all'), ['a:read', 'b:read'])),
    ).toBe(true);
  });

  it('modo any acepta uno solo', () => {
    expect(guard.canActivate(ctxFor(handlerOf('any'), ['b:read']))).toBe(true);
  });
});
