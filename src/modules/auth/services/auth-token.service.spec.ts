import { UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { CryptoHelper } from '@common/helpers/crypto-helpers';
import { createPrismaDatasourceMock } from '../../../../test/mocks/prisma.mock';
import { AuthTokenService } from './auth-token.service';

jest.mock('@common/helpers/crypto-helpers', () => ({
  CryptoHelper: {
    initConfigService: jest.fn(),
    generateToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  },
}));

describe('AuthTokenService', () => {
  const { prisma, client } = createPrismaDatasourceMock();
  const config = {
    authentication: {
      accessTokenExpires: '15m',
      refreshTokenExpires: '30d',
      shortRefreshTokenExpires: '1d',
    },
  };
  const crypto = CryptoHelper as unknown as Record<string, jest.Mock>;
  let service: AuthTokenService;

  const user = {
    referenceId: 'ref',
    email: 'a@b.c',
    status: UserStatus.ACTIVE,
    isEmployee: false,
    firstName: 'A',
    lastName: 'B',
    currentAccessLevel: 'GROUP',
    profileStatus: 'COMPLETE',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthTokenService(prisma as never, config as never);
  });

  it('inicializa CryptoHelper con la configuración', () => {
    expect(crypto.initConfigService).toHaveBeenCalledWith(config);
  });

  describe('generateTokens', () => {
    beforeEach(() =>
      crypto.generateToken
        .mockReturnValueOnce('access')
        .mockReturnValueOnce('refresh'),
    );

    it('usa la expiración larga con rememberMe', () => {
      const r = service.generateTokens({
        user: user as never,
        rememberMe: true,
      });
      expect(r).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
      expect(crypto.generateToken).toHaveBeenNthCalledWith(
        1,
        'accessToken',
        expect.objectContaining({ sub: 'ref', email: 'a@b.c' }),
        'RS256',
        '15m',
      );
      expect(crypto.generateToken).toHaveBeenNthCalledWith(
        2,
        'refreshToken',
        { sub: 'ref', type: 'refresh' },
        'RS256',
        '30d',
      );
    });

    it('usa la expiración corta sin rememberMe', () => {
      service.generateTokens({ user: user as never, rememberMe: false });
      expect(crypto.generateToken.mock.calls[1][3]).toBe('1d');
    });
  });

  describe('generateAccessTokenFromRefresh', () => {
    beforeEach(() =>
      crypto.verifyRefreshToken.mockReturnValue({
        tokenType: 'refreshToken',
        sub: 'ref',
      }),
    );

    it('rechaza tokens que no son de refresco', async () => {
      crypto.verifyRefreshToken.mockReturnValue({ tokenType: 'accessToken' });
      await expect(service.generateAccessTokenFromRefresh('t')).rejects.toThrow(
        'Token de refresco inválido.',
      );
      expect(client.users.findUnique).not.toHaveBeenCalled();
    });

    it('rechaza usuario inexistente', async () => {
      client.users.findUnique.mockResolvedValue(null);
      await expect(service.generateAccessTokenFromRefresh('t')).rejects.toThrow(
        'Usuario inexistente.',
      );
    });

    it('rechaza usuario no activo', async () => {
      client.users.findUnique.mockResolvedValue({
        ...user,
        status: UserStatus.BLOCKED,
      });
      await expect(service.generateAccessTokenFromRefresh('t')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('emite un nuevo access token para usuario activo', async () => {
      client.users.findUnique.mockResolvedValue(user);
      crypto.generateToken.mockReturnValue('new-access');
      await expect(service.generateAccessTokenFromRefresh('t')).resolves.toBe(
        'new-access',
      );
      expect(client.users.findUnique.mock.calls[0][0].where).toEqual({
        referenceId: 'ref',
      });
    });
  });
});
