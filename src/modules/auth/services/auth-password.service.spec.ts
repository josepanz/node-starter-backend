import {
  BadRequestException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { UserCredentialsWithUser } from '@modules/auth/types';
import { AuthPasswordService } from './auth-password.service';

const mockUpdateLockState = jest.fn();
const mockUpdate = jest.fn();
const mockCreate = jest.fn();
const mockFindByUserId = jest.fn();
const mockUpdateStatus = jest.fn();

const buildService = (overrides: Record<string, unknown> = {}) =>
  new AuthPasswordService(
    {
      updateLockState: mockUpdateLockState,
      update: mockUpdate,
      create: mockCreate,
      findByUserId: mockFindByUserId,
    } as never,
    { updateStatus: mockUpdateStatus } as never,
    {
      security: {
        maxLoginAttempts: 3,
        lockoutMinutes: 15,
        passwordExpirationDays: 30,
        passwordPolicy: {
          minLength: 8,
          maxLength: 72,
          requireUppercase: true,
          requireLowercase: true,
          requireDigit: true,
          requireSymbol: false,
        },
        ...overrides,
      },
    } as never,
  );

const credential = (extra: Partial<UserCredentialsWithUser> = {}) =>
  ({
    id: 1,
    userId: 9,
    attempts: 0,
    lockedUntil: null,
    expiredAt: null,
    ...extra,
  }) as UserCredentialsWithUser;

describe('AuthPasswordService - seguridad de credenciales', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handleFailedAttempt incrementa sin bloquear bajo el máximo', async () => {
    const result = await buildService().handleFailedAttempt(
      credential({ attempts: 0 }),
    );

    expect(result.shouldBlock).toBe(false);
    expect(mockUpdateLockState).toHaveBeenCalledWith(1, {
      attempts: 1,
      lockedUntil: null,
    });
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('handleFailedAttempt aplica bloqueo temporal al llegar al máximo', async () => {
    const result = await buildService().handleFailedAttempt(
      credential({ attempts: 2 }),
    );

    expect(result.shouldBlock).toBe(true);
    expect(result.lockedUntil).toBeInstanceOf(Date);
    expect(mockUpdateStatus).not.toHaveBeenCalled();
  });

  it('handleFailedAttempt bloquea el usuario si LOCKOUT_MINUTES=0', async () => {
    await buildService({ lockoutMinutes: 0 }).handleFailedAttempt(
      credential({ attempts: 2 }),
    );

    expect(mockUpdateStatus).toHaveBeenCalledWith(9, UserStatus.BLOCKED);
  });

  it('assertNotLocked lanza 423 si el bloqueo está vigente y pasa si venció', () => {
    const service = buildService();
    expect(() =>
      service.assertNotLocked(
        credential({ lockedUntil: new Date(Date.now() + 60_000) }),
      ),
    ).toThrow(HttpException);
    expect(() =>
      service.assertNotLocked(
        credential({ lockedUntil: new Date(Date.now() - 1000) }),
      ),
    ).not.toThrow();
  });

  it('resetFailedAttempts limpia intentos y bloqueo solo si hacía falta', async () => {
    const service = buildService();
    await service.resetFailedAttempts(credential());
    expect(mockUpdateLockState).not.toHaveBeenCalled();

    await service.resetFailedAttempts(credential({ attempts: 2 }));
    expect(mockUpdateLockState).toHaveBeenCalledWith(1, {
      attempts: 0,
      lockedUntil: null,
    });
  });

  it('assertPasswordNotExpired rechaza contraseñas vencidas', () => {
    const service = buildService();
    expect(() =>
      service.assertPasswordNotExpired(
        credential({ expiredAt: new Date(Date.now() - 1000) }),
      ),
    ).toThrow(ForbiddenException);
    expect(() => service.assertPasswordNotExpired(credential())).not.toThrow();
  });

  it('createOrUpdatePassword valida la política y fija expiración', async () => {
    const service = buildService();
    await expect(service.createOrUpdatePassword(1, 'weak')).rejects.toThrow(
      BadRequestException,
    );

    mockFindByUserId.mockResolvedValue(null);
    await service.createOrUpdatePassword(1, 'Abcdef12');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        expiredAt: expect.any(Date) as Date,
      }),
    );
  });
});
