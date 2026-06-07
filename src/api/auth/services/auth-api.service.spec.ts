import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import {
  AccessLevel,
  DocumentType,
  UserProfileStatus,
  UserStatus,
  Users,
} from '@prisma/client';

import { AuthApiService } from './auth-api.service';
import { AuthMigrationService } from './auth-migration.service';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { AuthService } from '@modules/auth/services/auth.service';
import { EmailService } from '@modules/email/services/email.service';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';
import * as DTO from '@api/auth/dtos';

// ─── Mock functions (module-scope standalone, evita @typescript-eslint/unbound-method) ───

const mockLogin = jest.fn();
const mockCreatePassword = jest.fn();
const mockChangePassword = jest.fn();
const mockResetPassword = jest.fn();
const mockAuthRefreshAccessToken = jest.fn();
const mockGetUserScope = jest.fn();
const mockVerifyUser = jest.fn();
const mockCheckVerificationStatus = jest.fn();

const mockFindUserById = jest.fn();

const mockLoginAndVerifyLegacyUser = jest.fn();

const mockMigrateAndLogin = jest.fn();
const mockVerifyTempToken = jest.fn();
const mockVerifyForgotPasswordToken = jest.fn();

const mockSendEmailByType = jest.fn();

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: 1,
  referenceId: 'ref-uuid-001',
  email: 'usuario@test.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  phoneNumber: '+595981234567',
  status: UserStatus.ACTIVE,
  profileStatus: UserProfileStatus.COMPLETE,
  currentAccessLevel: AccessLevel.COMMERCE,
  isEmployee: false,
  documentNumber: '12345678',
  documentType: DocumentType.CIP,
  legacyUserId: null,
  isLdap: false,
  lastLogin: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  createdBy: 'test',
  updatedBy: null,
  deletedAt: null,
  acceptedTermsAt: null,
} as unknown as Users;

const mockJwtUser: IUserDataOnJwt = {
  id: 1,
  referenceId: 'ref-uuid-001',
  email: 'usuario@test.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  currentAccessLevel: AccessLevel.COMMERCE,
  userStatus: UserStatus.ACTIVE,
  profileStatus: UserProfileStatus.COMPLETE,
  permissions: [],
  roles: [],
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('AuthApiService', () => {
  let service: AuthApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthApiService,
        {
          provide: UsersDBService,
          useValue: { findUserById: mockFindUserById },
        },
        {
          provide: AuthService,
          useValue: {
            login: mockLogin,
            createPassword: mockCreatePassword,
            changePassword: mockChangePassword,
            resetPassword: mockResetPassword,
            refreshAccessToken: mockAuthRefreshAccessToken,
            getUserScope: mockGetUserScope,
            verifyUser: mockVerifyUser,
            checkVerificationStatus: mockCheckVerificationStatus,
          },
        },
        {
          provide: EmailService,
          useValue: { sendEmailByType: mockSendEmailByType },
        },
        {
          provide: AuthMigrationService,
          useValue: {
            migrateAndLogin: mockMigrateAndLogin,
            verifyTempToken: mockVerifyTempToken,
            verifyForgotPasswordToken: mockVerifyForgotPasswordToken,
          },
        },
      ],
    }).compile();

    service = module.get<AuthApiService>(AuthApiService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── handleLogin ──────────────────────────────────────────────────────────

  describe('handleLogin', () => {
    const loginDto: DTO.LoginUserDTO = {
      email: 'usuario@test.com',
      encryptedPassword: 'encryptedPass123',
      rememberMe: false,
    };

    it('retorna login exitoso con tokens cuando las credenciales son válidas', async () => {
      mockLogin.mockResolvedValue({
        success: true,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiresPasswordCreation: false,
      });

      const result = await service.handleLogin(loginDto);

      expect(result).toEqual({
        login: true,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        requiredNewPassword: false,
      });
      expect(mockLogin).toHaveBeenCalledWith({
        email: loginDto.email,
        encryptedPassword: loginDto.encryptedPassword,
        userAgent: undefined,
        rembemberMe: false,
      });
    });

    it('propaga el userAgent al AuthService cuando es proporcionado', async () => {
      mockLogin.mockResolvedValue({
        success: true,
        accessToken: 'token',
        refreshToken: 'refresh',
        requiresPasswordCreation: false,
      });

      await service.handleLogin(loginDto, 'Mozilla/5.0');

      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({ userAgent: 'Mozilla/5.0' }),
      );
    });

    it('retorna requiredNewPassword cuando el usuario existe pero no tiene contraseña', async () => {
      mockLogin.mockResolvedValue({
        success: false,
        requiresPasswordCreation: true,
      });

      const result = await service.handleLogin(loginDto);

      expect(result).toEqual({ login: false, requiredNewPassword: true });
    });

    it('retorna login fallido cuando no existe usuario legacy', async () => {
      mockLogin.mockResolvedValue({
        success: false,
        requiresPasswordCreation: false,
      });
      mockLoginAndVerifyLegacyUser.mockResolvedValue(undefined);

      const result = await service.handleLogin(loginDto);

      expect(result).toEqual({ login: false, requiredNewPassword: false });
    });

    it('retorna login fallido si el usuario no se encuentra tras migrar el usuario legacy', async () => {
      mockLogin.mockResolvedValue({
        success: false,
        requiresPasswordCreation: false,
      });

      const result = await service.handleLogin(loginDto);

      expect(result).toEqual({ login: false, requiredNewPassword: false });
    });
  });

  // ─── createPasswordWithToken ──────────────────────────────────────────────

  describe('createPasswordWithToken', () => {
    const dto: DTO.CreatePasswordDTO = {
      email: 'usuario@test.com',
      encryptedPassword: 'encryptedPass',
      token: 'valid-token',
    };

    it('crea contraseña cuando el token es válido y el email coincide', async () => {
      mockVerifyTempToken.mockReturnValue(undefined);
      mockCreatePassword.mockResolvedValue({
        success: true,
        message: 'Contraseña creada.',
      });

      const result = await service.createPasswordWithToken(dto);

      expect(result).toEqual({ success: true, message: 'Contraseña creada.' });
      expect(mockVerifyTempToken).toHaveBeenCalledWith(dto.token, dto.email);
      expect(mockCreatePassword).toHaveBeenCalledWith({
        email: dto.email,
        encryptedPassword: dto.encryptedPassword,
      });
    });

    it('lanza UnauthorizedException cuando el token es inválido', async () => {
      mockVerifyTempToken.mockImplementation(() => {
        throw new UnauthorizedException('Token inválido o expirado.');
      });

      await expect(service.createPasswordWithToken(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── updatePassword ───────────────────────────────────────────────────────

  describe('updatePassword', () => {
    it('delega el cambio de contraseña al AuthService y retorna el resultado', async () => {
      const payload = {
        email: 'usuario@test.com',
        encryptedOldPassword: 'oldPass',
        encryptedNewPassword: 'newPass',
      };
      mockChangePassword.mockResolvedValue({
        success: true,
        message: 'Contraseña actualizada correctamente.',
      });

      const result = await service.updatePassword(payload);

      expect(result).toEqual({
        success: true,
        message: 'Contraseña actualizada correctamente.',
      });
      expect(mockChangePassword).toHaveBeenCalledWith(payload);
    });
  });

  // ─── forgotPassword ───────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    const payload = {
      token: 'valid-reset-token',
      encryptedNewPassword: 'newPass',
      encryptedConfirmPassword: 'newPass',
    };

    it('resetea la contraseña cuando el token de recuperación es válido', async () => {
      mockVerifyForgotPasswordToken.mockReturnValue('usuario@test.com');
      mockResetPassword.mockResolvedValue({
        success: true,
        message: 'Contraseña actualizada correctamente.',
      });

      const result = await service.forgotPassword(payload);

      expect(result).toEqual({
        success: true,
        message: 'Contraseña actualizada correctamente.',
      });
      expect(mockVerifyForgotPasswordToken).toHaveBeenCalledWith(payload.token);
      expect(mockResetPassword).toHaveBeenCalledWith({
        email: 'usuario@test.com',
        encryptedNewPassword: payload.encryptedNewPassword,
        encryptedConfirmPassword: payload.encryptedConfirmPassword,
      });
    });

    it('lanza UnauthorizedException cuando el token es inválido o expirado', async () => {
      mockVerifyForgotPasswordToken.mockImplementation(() => {
        throw new UnauthorizedException('Token inválido o expirado.');
      });

      await expect(service.forgotPassword(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ─── refreshAccessToken ───────────────────────────────────────────────────

  describe('refreshAccessToken', () => {
    it('retorna un nuevo access token delegando al AuthService', async () => {
      mockAuthRefreshAccessToken.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const result = await service.refreshAccessToken('valid-refresh-token');

      expect(result).toEqual({ accessToken: 'new-access-token' });
      expect(mockAuthRefreshAccessToken).toHaveBeenCalledWith(
        'valid-refresh-token',
      );
    });
  });

  // ─── scope ────────────────────────────────────────────────────────────────

  describe('scope', () => {
    it('retorna el scope completo del usuario con roles y permisos', async () => {
      mockFindUserById.mockResolvedValue(mockUser);
      mockGetUserScope.mockResolvedValue({
        roles: [{ name: 'merchant-admin', description: 'Administrador' }],
        permissions: [{ name: 'dashboard:read' }],
      });

      const result = await service.scope(mockJwtUser);

      expect(result.user).toEqual({
        id: mockUser.referenceId,
        email: mockUser.email,
        phoneNumber: mockUser.phoneNumber,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        status: mockUser.status,
        profileStatus: mockUser.profileStatus,
        currentAccessLevel: mockUser.currentAccessLevel,
        isEmployee: mockUser.isEmployee,
      });
      expect(result.roles).toHaveLength(1);
      expect(result.permissions).toHaveLength(1);
    });

    it('consulta usuario y scope en paralelo', async () => {
      mockFindUserById.mockResolvedValue(mockUser);
      mockGetUserScope.mockResolvedValue({ roles: [], permissions: [] });

      await service.scope(mockJwtUser);

      expect(mockFindUserById).toHaveBeenCalledWith(mockJwtUser.id);
      expect(mockGetUserScope).toHaveBeenCalledWith(mockJwtUser.id);
    });
  });

  // ─── userVerify ───────────────────────────────────────────────────────────

  describe('userVerify', () => {
    it('delega la verificación del usuario al AuthService con su ID', async () => {
      mockVerifyUser.mockResolvedValue(undefined);

      await service.userVerify(mockUser);

      expect(mockVerifyUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  // ─── userVerificationStatus ───────────────────────────────────────────────

  describe('userVerificationStatus', () => {
    it('retorna el estado de verificación del usuario', async () => {
      mockCheckVerificationStatus.mockResolvedValue({
        verified: true,
        email: mockUser.email,
      });

      const result = await service.userVerificationStatus(mockUser);

      expect(result).toEqual({ verified: true, email: mockUser.email });
      expect(mockCheckVerificationStatus).toHaveBeenCalledWith(mockUser);
    });
  });

  // ─── sendVerificationEmail ────────────────────────────────────────────────

  describe('sendVerificationEmail', () => {
    it('envía email de verificación al destino indicado', async () => {
      mockSendEmailByType.mockResolvedValue(undefined);

      await service.sendVerificationEmail(mockUser.email, mockUser);

      expect(mockSendEmailByType).toHaveBeenCalledWith(
        mockUser.email,
        EmailTypeEnum.VERIFICATION,
        mockUser,
      );
    });
  });

  // ─── sendPasswordResetEmail ───────────────────────────────────────────────

  describe('sendPasswordResetEmail', () => {
    it('envía email de recuperación de contraseña con expiración de 24h', async () => {
      mockSendEmailByType.mockResolvedValue(undefined);

      await service.sendPasswordResetEmail(mockUser.email, mockUser);

      expect(mockSendEmailByType).toHaveBeenCalledWith(
        mockUser.email,
        EmailTypeEnum.FORGOT_PASSWORD,
        mockUser,
        '24h',
      );
    });
  });

  // ─── sendPasswordCreationEmail ────────────────────────────────────────────

  describe('sendPasswordCreationEmail', () => {
    it('envía email de creación de contraseña al usuario', async () => {
      mockSendEmailByType.mockResolvedValue(undefined);

      await service.sendPasswordCreationEmail(mockUser.email, mockUser);

      expect(mockSendEmailByType).toHaveBeenCalledWith(
        mockUser.email,
        EmailTypeEnum.CREATE_PASSWORD,
        mockUser,
      );
    });
  });
});
