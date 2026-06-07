import { Test, TestingModule } from '@nestjs/testing';

import { AuthCookieService } from './auth-cookie.service';
import { APP_CONFIG } from '@core/config/config-loader';

describe('AuthCookieService', () => {
  let service: AuthCookieService;
  let res: { cookie: jest.Mock };

  const mockConfig = {
    authentication: {
      accessTokenExpires: '15m',
      refreshTokenExpires: '30d',
      shortRefreshTokenExpires: '1d',
    },
  };

  beforeEach(async () => {
    res = { cookie: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCookieService,
        { provide: APP_CONFIG.KEY, useValue: mockConfig },
      ],
    }).compile();

    service = module.get(AuthCookieService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('setAccessToken', () => {
    it('debe establecer la cookie accessToken con opciones seguras y maxAge calculado desde config', () => {
      service.setAccessToken(res as any, 'access-token-abc');

      expect(res.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access-token-abc',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 15 * 60 * 1000,
        },
      );
    });

    it('debe llamar a res.cookie exactamente una vez', () => {
      service.setAccessToken(res as any, 'tok');

      expect(res.cookie).toHaveBeenCalledTimes(1);
    });
  });

  describe('setRefreshToken', () => {
    it('debe usar refreshTokenExpires cuando rememberMe es true', () => {
      service.setRefreshToken(res as any, 'refresh-token-abc', true);

      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-abc',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      );
    });

    it('debe usar shortRefreshTokenExpires cuando rememberMe es false', () => {
      service.setRefreshToken(res as any, 'refresh-token-abc', false);

      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token-abc',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
          maxAge: 1 * 24 * 60 * 60 * 1000,
        },
      );
    });

    it('el maxAge con rememberMe=true debe ser mayor que con rememberMe=false', () => {
      service.setRefreshToken(res as any, 'tok-a', true);
      const [, , optsTrue] = res.cookie.mock.calls[0];

      res.cookie.mockClear();

      service.setRefreshToken(res as any, 'tok-b', false);
      const [, , optsFalse] = res.cookie.mock.calls[0];

      expect(optsTrue.maxAge).toBeGreaterThan(optsFalse.maxAge);
    });

    it('debe usar httpOnly, secure y sameSite=strict en ambos modos', () => {
      service.setRefreshToken(res as any, 'tok', true);

      const [, , opts] = res.cookie.mock.calls[0];
      expect(opts).toMatchObject({
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
    });
  });
});
