import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthMigrationService } from './auth-migration.service';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { AuthTokenService } from '@modules/auth/services/auth-token.service';
import { CryptoHelper } from '@common/helpers/crypto-helpers';

// ─── Mock functions ───────────────────────────────────────────────────────────

const mockFindActiveUserByEmail = jest.fn();
const mockCreateUser = jest.fn();

const mockCreatePassword = jest.fn();

const mockGenerateTokens = jest.fn();

// ─── Fixtures ─────────────────────────────────────────────────────────────────

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AuthMigrationService', () => {
  let service: AuthMigrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthMigrationService,
        {
          provide: UsersDBService,
          useValue: {
            findActiveUserByEmail: mockFindActiveUserByEmail,
            createUser: mockCreateUser,
          },
        },
        {
          provide: AuthService,
          useValue: { createPassword: mockCreatePassword },
        },
        {
          provide: AuthTokenService,
          useValue: { generateTokens: mockGenerateTokens },
        },
      ],
    }).compile();

    service = module.get<AuthMigrationService>(AuthMigrationService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── verifyTempToken ──────────────────────────────────────────────────────

  describe('verifyTempToken', () => {
    it('no lanza excepción cuando el token es válido y el email coincide', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockReturnValue({
        sub: 'user-1',
        email: 'usuario@test.com',
        tokenType: 'tempToken',
      } as never);

      expect(() =>
        service.verifyTempToken('valid-token', 'usuario@test.com'),
      ).not.toThrow();
    });

    it('lanza UnauthorizedException cuando el tokenType no es tempToken', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockReturnValue({
        sub: 'user-1',
        email: 'usuario@test.com',
        tokenType: 'accessToken',
      } as never);

      expect(() =>
        service.verifyTempToken('invalid-token', 'usuario@test.com'),
      ).toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException cuando el email del token no coincide', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockReturnValue({
        sub: 'user-1',
        email: 'otro@test.com',
        tokenType: 'tempToken',
      } as never);

      expect(() =>
        service.verifyTempToken('token', 'usuario@test.com'),
      ).toThrow(UnauthorizedException);
    });

    it('lanza UnauthorizedException cuando el token expiró o su firma es inválida', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() =>
        service.verifyTempToken('expired-token', 'usuario@test.com'),
      ).toThrow(UnauthorizedException);
    });
  });

  // ─── verifyForgotPasswordToken ────────────────────────────────────────────

  describe('verifyForgotPasswordToken', () => {
    it('retorna el email del payload cuando el token de recuperación es válido', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockReturnValue({
        sub: 'user-1',
        email: 'usuario@test.com',
        tokenType: 'tempToken',
        action: 'forgotPassword',
      } as never);

      const email = service.verifyForgotPasswordToken('valid-token');

      expect(email).toBe('usuario@test.com');
    });

    it('lanza UnauthorizedException cuando el tokenType no es tempToken', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockReturnValue({
        sub: 'user-1',
        email: 'usuario@test.com',
        tokenType: 'accessToken',
        action: 'forgotPassword',
      } as never);

      expect(() => service.verifyForgotPasswordToken('token')).toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException cuando la acción no es forgotPassword', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockReturnValue({
        sub: 'user-1',
        email: 'usuario@test.com',
        tokenType: 'tempToken',
        action: 'createPassword',
      } as never);

      expect(() => service.verifyForgotPasswordToken('token')).toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException cuando el token expiró o su firma es inválida', () => {
      jest.spyOn(CryptoHelper, 'verifyJwt').mockImplementation(() => {
        throw new Error('jwt expired');
      });

      expect(() => service.verifyForgotPasswordToken('expired-token')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
