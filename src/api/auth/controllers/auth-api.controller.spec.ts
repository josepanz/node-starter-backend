import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

import { Users } from '@prisma/client';

import { AuthApiController } from './auth-api.controller';
import { AuthApiService } from '@api/auth/services/auth-api.service';
import { AuthCookieService } from '@api/auth/services/auth-cookie.service';
import { IAuthenticatedRequest } from '@api/auth/interfaces';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';
import { UserByEmailLoaderGuard } from '@modules/auth/guards/user-by-email-loader.guard';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import * as DTO from '@api/auth/dtos';

const passGuard = { canActivate: jest.fn().mockReturnValue(true) };

// Mock functions independientes — evitan @typescript-eslint/unbound-method
const mockHandleLogin = jest.fn();
const mockCreatePasswordWithToken = jest.fn();
const mockUpdatePassword = jest.fn();
const mockForgotPassword = jest.fn();
const mockRefreshAccessToken = jest.fn();
const mockScope = jest.fn();
const mockUserVerify = jest.fn();
const mockUserVerificationStatus = jest.fn();
const mockSendVerificationEmail = jest.fn();
const mockSendPasswordCreationEmail = jest.fn();
const mockSendPasswordResetEmail = jest.fn();

const mockSetAccessToken = jest.fn();
const mockSetRefreshToken = jest.fn();

describe('AuthApiController', () => {
  let controller: AuthApiController;
  let res: { cookie: jest.Mock };

  beforeEach(async () => {
    res = { cookie: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthApiController],
      providers: [
        {
          provide: AuthApiService,
          useValue: {
            handleLogin: mockHandleLogin,
            createPasswordWithToken: mockCreatePasswordWithToken,
            updatePassword: mockUpdatePassword,
            forgotPassword: mockForgotPassword,
            refreshAccessToken: mockRefreshAccessToken,
            scope: mockScope,
            userVerify: mockUserVerify,
            userVerificationStatus: mockUserVerificationStatus,
            sendVerificationEmail: mockSendVerificationEmail,
            sendPasswordCreationEmail: mockSendPasswordCreationEmail,
            sendPasswordResetEmail: mockSendPasswordResetEmail,
          },
        },
        {
          provide: AuthCookieService,
          useValue: {
            setAccessToken: mockSetAccessToken,
            setRefreshToken: mockSetRefreshToken,
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(passGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(passGuard)
      .overrideGuard(BasicAuthGuard)
      .useValue(passGuard)
      .overrideGuard(UserByEmailLoaderGuard)
      .useValue(passGuard)
      .overrideGuard(AuthGuard('jwt-refresh'))
      .useValue(passGuard)
      .compile();

    controller = module.get(AuthApiController);
  });

  afterEach(() => jest.clearAllMocks());

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto: DTO.LoginUserDTO = {
      email: 'user@test.com',
      encryptedPassword: 'enc123',
      rememberMe: false,
    };
    const req = {
      headers: { 'user-agent': 'Mozilla/5.0' },
    } as unknown as Request;

    it('debe establecer accessToken y refreshToken via cookieService y retornar datos de sesión cuando el login es exitoso', async () => {
      mockHandleLogin.mockResolvedValue({
        login: true,
        accessToken: 'at-token',
        refreshToken: 'rt-token',
        requiredNewPassword: false,
      });

      const result = await controller.login(
        dto,
        req,
        res as unknown as Response,
      );

      expect(mockHandleLogin).toHaveBeenCalledWith(dto, 'Mozilla/5.0');
      expect(mockSetAccessToken).toHaveBeenCalledWith(res, 'at-token');
      expect(mockSetRefreshToken).toHaveBeenCalledWith(res, 'rt-token', false);
      expect(result).toEqual({
        login: true,
        requiredNewPassword: false,
        accessToken: 'at-token',
      });
    });

    it('debe pasar rememberMe=true a cookieService.setRefreshToken cuando el DTO lo indica', async () => {
      mockHandleLogin.mockResolvedValue({
        login: true,
        accessToken: 'at',
        refreshToken: 'rt',
        requiredNewPassword: false,
      });

      await controller.login(
        { ...dto, rememberMe: true },
        req,
        res as unknown as Response,
      );

      expect(mockSetRefreshToken).toHaveBeenCalledWith(res, 'rt', true);
    });

    it('no debe llamar a setRefreshToken cuando el servicio no devuelve refreshToken', async () => {
      mockHandleLogin.mockResolvedValue({
        login: false,
        requiredNewPassword: true,
      });

      await controller.login(dto, req, res as unknown as Response);

      expect(mockSetRefreshToken).not.toHaveBeenCalled();
    });

    it('no debe llamar a setAccessToken cuando el servicio no devuelve accessToken', async () => {
      mockHandleLogin.mockResolvedValue({
        login: false,
        requiredNewPassword: true,
      });

      await controller.login(dto, req, res as unknown as Response);

      expect(mockSetAccessToken).not.toHaveBeenCalled();
    });

    it('debe asumir rememberMe=false cuando el DTO no lo incluye', async () => {
      mockHandleLogin.mockResolvedValue({
        login: true,
        accessToken: 'at',
        refreshToken: 'rt',
        requiredNewPassword: false,
      });

      await controller.login(
        { email: 'a@b.com', encryptedPassword: 'x' },
        req,
        res as unknown as Response,
      );

      expect(mockSetRefreshToken).toHaveBeenCalledWith(res, 'rt', false);
    });

    it('debe propagar la excepción cuando el servicio falla', async () => {
      mockHandleLogin.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.login(dto, req, res as unknown as Response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── createPassword ─────────────────────────────────────────────────────────

  describe('createPassword', () => {
    it('debe delegar al servicio y retornar su respuesta sin modificarla', async () => {
      const dto: DTO.CreatePasswordDTO = {
        token: 'tok',
        email: 'u@t.com',
        encryptedPassword: 'enc',
      };
      mockCreatePasswordWithToken.mockResolvedValue({
        success: true,
        message: 'OK',
      });

      const result = await controller.createPassword(dto);

      expect(mockCreatePasswordWithToken).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ success: true, message: 'OK' });
    });

    it('debe propagar UnauthorizedException cuando el token es inválido', async () => {
      mockCreatePasswordWithToken.mockRejectedValue(
        new UnauthorizedException('Token inválido o expirado.'),
      );

      await expect(
        controller.createPassword({} as unknown as DTO.CreatePasswordDTO),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── changePassword ─────────────────────────────────────────────────────────

  describe('changePassword', () => {
    const dto: DTO.UpdateUserPasswordDTO = {
      email: 'u@t.com',
      encryptedOldPassword: 'old',
      encryptedNewPassword: 'new',
    };

    it('debe mapear exactamente los tres campos del DTO al servicio', async () => {
      mockUpdatePassword.mockResolvedValue({
        success: true,
        message: 'Actualizado.',
      });

      const result = await controller.changePassword(dto);

      expect(mockUpdatePassword).toHaveBeenCalledWith({
        email: 'u@t.com',
        encryptedOldPassword: 'old',
        encryptedNewPassword: 'new',
      });
      expect(result).toEqual({ success: true, message: 'Actualizado.' });
    });

    it('debe propagar errores del servicio', async () => {
      mockUpdatePassword.mockRejectedValue(new UnauthorizedException());

      await expect(controller.changePassword(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── forgotPassword ─────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('debe pasar el payload completo al servicio y retornar su respuesta', async () => {
      const dto: DTO.ForgotUserPasswordDTO = {
        token: 'reset-tok',
        encryptedNewPassword: 'new',
        encryptedConfirmPassword: 'confirm',
      };
      mockForgotPassword.mockResolvedValue({
        success: true,
        message: 'Reset OK.',
      });

      const result = await controller.forgotPassword(dto);

      expect(mockForgotPassword).toHaveBeenCalledWith({
        token: 'reset-tok',
        encryptedNewPassword: 'new',
        encryptedConfirmPassword: 'confirm',
      });
      expect(result).toEqual({ success: true, message: 'Reset OK.' });
    });
  });

  // ── refreshToken ───────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('debe generar nuevo accessToken via authApiService, establecer su cookie y retornar el token', async () => {
      const req = {
        cookies: { refreshToken: 'old-rt' },
      } as unknown as IAuthenticatedRequest;
      mockRefreshAccessToken.mockResolvedValue({ accessToken: 'new-at' });

      const result = await controller.refreshToken(
        req,
        res as unknown as Response,
      );

      expect(mockRefreshAccessToken).toHaveBeenCalledWith('old-rt');
      expect(mockSetAccessToken).toHaveBeenCalledWith(res, 'new-at');
      expect(result).toEqual({
        message: 'Token actualizado',
        accessToken: 'new-at',
      });
    });

    it('debe lanzar UnauthorizedException cuando la cookie refreshToken no está presente', async () => {
      const req = { cookies: {} } as unknown as IAuthenticatedRequest;

      await expect(
        controller.refreshToken(req, res as unknown as Response),
      ).rejects.toThrow(new UnauthorizedException('No se provee el token.'));
      expect(mockRefreshAccessToken).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException cuando cookies es undefined', async () => {
      const req = { cookies: undefined } as unknown as IAuthenticatedRequest;

      await expect(
        controller.refreshToken(req, res as unknown as Response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ── scope ──────────────────────────────────────────────────────────────────

  describe('scope', () => {
    it('debe retornar el scope del usuario extraído del JWT', async () => {
      const user = { id: 1, email: 'u@t.com' } as unknown as IUserDataOnJwt;
      const scopeData = { user: { id: 1 }, roles: [], permissions: [] };
      mockScope.mockResolvedValue(scopeData);

      const result = await controller.scope(user);

      expect(mockScope).toHaveBeenCalledWith(user);
      expect(result).toEqual(scopeData);
    });
  });

  // ── userVerify ─────────────────────────────────────────────────────────────

  describe('userVerify', () => {
    it('debe invocar la verificación del usuario delegando el objeto user completo', async () => {
      const user = { id: 1 } as unknown as Users;
      mockUserVerify.mockResolvedValue(undefined);

      await controller.userVerify(user);

      expect(mockUserVerify).toHaveBeenCalledWith(user);
    });
  });

  // ── userVerificationStatus ─────────────────────────────────────────────────

  describe('userVerificationStatus', () => {
    it('debe retornar el estado de verificación usando el user del guard, no el query', async () => {
      const query: DTO.VerificationStatusQueryDTO = { email: 'u@t.com' };
      const user = { email: 'u@t.com' } as unknown as Users;
      mockUserVerificationStatus.mockResolvedValue({
        verified: true,
        email: 'u@t.com',
      });

      const result = await controller.userVerificationStatus(query, user);

      expect(mockUserVerificationStatus).toHaveBeenCalledWith(user);
      expect(result).toEqual({ verified: true, email: 'u@t.com' });
    });
  });

  // ── sendVerificationEmail ──────────────────────────────────────────────────

  describe('sendVerificationEmail', () => {
    it('debe invocar el servicio con email y user, y retornar el mensaje fijo de confirmación', async () => {
      const dto: DTO.EmailSendRequestDTO = { email: 'u@t.com' };
      const user = { id: 1 } as unknown as Users;
      mockSendVerificationEmail.mockResolvedValue(undefined);

      const result = await controller.sendVerificationEmail(dto, user);

      expect(mockSendVerificationEmail).toHaveBeenCalledWith('u@t.com', user);
      expect(result).toEqual({
        message: 'Email de verificación enviado correctamente.',
      });
    });
  });

  // ── sendCreatePasswordEmail ────────────────────────────────────────────────

  describe('sendCreatePasswordEmail', () => {
    it('debe invocar el servicio y retornar el mensaje fijo de confirmación', async () => {
      const dto: DTO.EmailSendRequestDTO = { email: 'u@t.com' };
      const user = { id: 2 } as unknown as Users;
      mockSendPasswordCreationEmail.mockResolvedValue(undefined);

      const result = await controller.sendCreatePasswordEmail(dto, user);

      expect(mockSendPasswordCreationEmail).toHaveBeenCalledWith(
        'u@t.com',
        user,
      );
      expect(result).toEqual({
        message: 'Email para creación de contraseña enviado correctamente.',
      });
    });
  });

  // ── sendPasswordResetEmail ─────────────────────────────────────────────────

  describe('sendPasswordResetEmail', () => {
    it('debe invocar el servicio y retornar el mensaje fijo de confirmación', async () => {
      const dto: DTO.EmailSendRequestDTO = { email: 'u@t.com' };
      const user = { id: 3 } as unknown as Users;
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await controller.sendPasswordResetEmail(dto, user);

      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith('u@t.com', user);
      expect(result).toEqual({
        message: 'Email para recuperación de cuenta enviado correctamente.',
      });
    });
  });
});
