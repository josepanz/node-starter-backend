import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const users = {
    findCredentialsByEmail: jest.fn(),
    findActiveUserByEmail: jest.fn(),
    updateLastLogin: jest.fn(),
    getUserRoles: jest.fn(),
    getUserPermissions: jest.fn(),
    getRolePermissions: jest.fn(),
    verifyUser: jest.fn(),
    findById: jest.fn(),
  };
  const tokens = {
    generateTokens: jest.fn(),
    generateAccessTokenFromRefresh: jest.fn(),
  };
  const passwords = {
    assertNotLocked: jest.fn(),
    validateEncryptedPassword: jest.fn(),
    handleFailedAttempt: jest.fn(),
    resetFailedAttempts: jest.fn(),
    assertPasswordNotExpired: jest.fn(),
    createOrUpdateEncryptedPassword: jest.fn(),
    changeEncryptedPassword: jest.fn(),
    decryptPassword: jest.fn(),
    createOrUpdatePassword: jest.fn(),
  };
  let service: AuthService;

  const credentials = (status: UserStatus = UserStatus.ACTIVE) => ({
    id: 1,
    userId: 10,
    passwordHash: 'h',
    user: { id: 10, status },
  });
  const loginPayload = {
    email: 'a@b.c',
    encryptedPassword: 'enc',
    rembemberMe: true,
  };

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AuthService(
      users as never,
      tokens as never,
      passwords as never,
    );
  });

  describe('login', () => {
    it('indica requiresPasswordCreation si el usuario existe sin credenciales', async () => {
      users.findCredentialsByEmail.mockResolvedValue(null);
      users.findActiveUserByEmail.mockResolvedValue({ id: 1 });
      await expect(service.login(loginPayload)).resolves.toEqual({
        success: false,
        requiresPasswordCreation: true,
      });
    });

    it('devuelve fallo genérico si el usuario no existe', async () => {
      users.findCredentialsByEmail.mockResolvedValue(null);
      users.findActiveUserByEmail.mockResolvedValue(null);
      await expect(service.login(loginPayload)).resolves.toEqual({
        success: false,
        requiresPasswordCreation: false,
      });
    });

    it.each([UserStatus.BLOCKED, UserStatus.INACTIVE, UserStatus.DELETED])(
      'rechaza usuario en estado %s sin evaluar la clave',
      async (status) => {
        users.findCredentialsByEmail.mockResolvedValue(credentials(status));
        await expect(service.login(loginPayload)).rejects.toThrow(
          UnauthorizedException,
        );
        expect(passwords.validateEncryptedPassword).not.toHaveBeenCalled();
      },
    );

    it('registra el intento fallido con clave inválida', async () => {
      const creds = credentials();
      users.findCredentialsByEmail.mockResolvedValue(creds);
      passwords.validateEncryptedPassword.mockReturnValue(false);
      await expect(service.login(loginPayload)).rejects.toThrow(
        'Credenciales inválidas.',
      );
      expect(passwords.handleFailedAttempt).toHaveBeenCalledWith(creds);
      expect(tokens.generateTokens).not.toHaveBeenCalled();
    });

    it('propaga el bloqueo temporal sin validar clave', async () => {
      users.findCredentialsByEmail.mockResolvedValue(credentials());
      passwords.assertNotLocked.mockImplementation(() => {
        throw new Error('locked');
      });
      await expect(service.login(loginPayload)).rejects.toThrow('locked');
      expect(passwords.validateEncryptedPassword).not.toHaveBeenCalled();
    });

    it.each([UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION])(
      'login exitoso con estado %s',
      async (status) => {
        const creds = credentials(status);
        users.findCredentialsByEmail.mockResolvedValue(creds);
        passwords.validateEncryptedPassword.mockReturnValue(true);
        tokens.generateTokens.mockReturnValue({
          accessToken: 'at',
          refreshToken: 'rt',
        });
        await expect(service.login(loginPayload)).resolves.toEqual({
          success: true,
          accessToken: 'at',
          refreshToken: 'rt',
          requiresPasswordCreation: false,
        });
        expect(passwords.resetFailedAttempts).toHaveBeenCalledWith(creds);
        expect(passwords.assertPasswordNotExpired).toHaveBeenCalledWith(creds);
        expect(users.updateLastLogin).toHaveBeenCalledWith(10);
        expect(tokens.generateTokens).toHaveBeenCalledWith({
          user: creds.user,
          rememberMe: true,
        });
      },
    );
  });

  describe('createPassword', () => {
    it('lanza NotFound si el usuario no existe', async () => {
      users.findActiveUserByEmail.mockResolvedValue(null);
      await expect(
        service.createPassword({ email: 'a', encryptedPassword: 'e' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('crea la contraseña', async () => {
      users.findActiveUserByEmail.mockResolvedValue({ id: 4 });
      const r = await service.createPassword({
        email: 'a',
        encryptedPassword: 'e',
      });
      expect(r.success).toBe(true);
      expect(passwords.createOrUpdateEncryptedPassword).toHaveBeenCalledWith(
        4,
        'e',
      );
    });
  });

  describe('changePassword', () => {
    const payload = {
      email: 'a',
      encryptedOldPassword: 'o',
      encryptedNewPassword: 'n',
    };

    it('lanza NotFound sin usuario', async () => {
      users.findActiveUserByEmail.mockResolvedValue(null);
      await expect(service.changePassword(payload)).rejects.toThrow(
        'Usuario no encontrado.',
      );
    });

    it('lanza NotFound sin credenciales', async () => {
      users.findActiveUserByEmail.mockResolvedValue({ id: 1 });
      users.findCredentialsByEmail.mockResolvedValue(null);
      await expect(service.changePassword(payload)).rejects.toThrow(
        /crear contraseña/,
      );
    });

    it('delega el cambio', async () => {
      const creds = credentials();
      users.findActiveUserByEmail.mockResolvedValue({ id: 1 });
      users.findCredentialsByEmail.mockResolvedValue(creds);
      const r = await service.changePassword(payload);
      expect(r.success).toBe(true);
      expect(passwords.changeEncryptedPassword).toHaveBeenCalledWith(
        creds,
        'o',
        'n',
      );
    });
  });

  describe('resetPassword', () => {
    const payload = {
      email: 'a',
      encryptedNewPassword: 'n',
      encryptedConfirmPassword: 'c',
    };

    it('rechaza si las contraseñas no coinciden', async () => {
      passwords.decryptPassword
        .mockReturnValueOnce('x')
        .mockReturnValueOnce('y');
      await expect(service.resetPassword(payload)).rejects.toThrow(
        'Las contraseñas no coinciden.',
      );
      expect(users.findActiveUserByEmail).not.toHaveBeenCalled();
    });

    it('lanza NotFound sin usuario', async () => {
      passwords.decryptPassword.mockReturnValue('x');
      users.findActiveUserByEmail.mockResolvedValue(null);
      await expect(service.resetPassword(payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFound sin credenciales', async () => {
      passwords.decryptPassword.mockReturnValue('x');
      users.findActiveUserByEmail.mockResolvedValue({ id: 1 });
      users.findCredentialsByEmail.mockResolvedValue(null);
      await expect(service.resetPassword(payload)).rejects.toThrow(
        /credenciales/,
      );
    });

    it('actualiza la contraseña', async () => {
      passwords.decryptPassword.mockReturnValue('x');
      users.findActiveUserByEmail.mockResolvedValue({ id: 1 });
      users.findCredentialsByEmail.mockResolvedValue(credentials());
      const r = await service.resetPassword(payload);
      expect(r.success).toBe(true);
      expect(passwords.createOrUpdatePassword).toHaveBeenCalledWith(1, 'x');
    });
  });

  it('refreshAccessToken devuelve el nuevo access token', async () => {
    tokens.generateAccessTokenFromRefresh.mockResolvedValue('new');
    await expect(service.refreshAccessToken('rt')).resolves.toEqual({
      accessToken: 'new',
    });
  });

  it('getUserScope combina y deduplica permisos de roles y directos', async () => {
    users.getUserRoles.mockResolvedValue([
      { id: 1, name: 'admin', description: 'Admin' },
    ]);
    users.getUserPermissions.mockResolvedValue([
      { name: 'a:read' },
      { name: 'b:read' },
    ]);
    users.getRolePermissions.mockResolvedValue([{ name: 'a:read' }]);
    const scope = await service.getUserScope(1);
    expect(users.getRolePermissions).toHaveBeenCalledWith([1]);
    expect(scope.roles).toEqual([{ name: 'admin', description: 'Admin' }]);
    expect(scope.permissions).toEqual([{ name: 'a:read' }, { name: 'b:read' }]);
  });

  it('verifyUser delega', async () => {
    await service.verifyUser(3);
    expect(users.verifyUser).toHaveBeenCalledWith(3);
  });

  describe('checkVerificationStatus', () => {
    it.each([
      [{ status: UserStatus.ACTIVE }, true],
      [{ status: UserStatus.PENDING_VERIFICATION }, false],
      [null, false],
    ])('usuario %j -> verified=%s', async (found, verified) => {
      users.findById.mockResolvedValue(found);
      await expect(
        service.checkVerificationStatus({ id: 1, email: 'e' } as never),
      ).resolves.toEqual({ verified, email: 'e' });
    });
  });
});
