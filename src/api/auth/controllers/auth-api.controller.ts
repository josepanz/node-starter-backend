import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Users } from '@prisma/client';

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Res,
  Req,
  Version,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import * as DTO from '@api/auth/dtos';

import { IAuthenticatedRequest } from '@api/auth/interfaces';

import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';
import { UserByEmailLoaderGuard } from '@modules/auth/guards/user-by-email-loader.guard';

import { User } from '@common/decorators/user.decorator';
import { Permissions } from '@common/decorators/permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';

import { AuthApiService } from '@api/auth/services/auth-api.service';
import { AuthCookieService } from '@api/auth/services/auth-cookie.service';
import { AuthDocs } from '@api/auth/docs/auth-api.docs';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthApiController {
  constructor(
    private readonly authApiService: AuthApiService,
    private readonly cookieService: AuthCookieService,
  ) {}

  @Post('login')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @AuthDocs('login')
  async login(
    @Body() dto: DTO.LoginUserDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DTO.LoginUserResponseDTO> {
    const userAgent = req.headers['user-agent'] as string;
    const data = await this.authApiService.handleLogin(dto, userAgent);

    if (data.accessToken) {
      this.cookieService.setAccessToken(res, data.accessToken);
    }

    if (data.refreshToken) {
      this.cookieService.setRefreshToken(
        res,
        data.refreshToken,
        dto.rememberMe ?? false,
      );
    }

    return {
      login: data.login,
      requiredNewPassword: data.requiredNewPassword,
      accessToken: data.accessToken,
    };
  }

  @Post('create-password')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @AuthDocs('createPassword')
  async createPassword(
    @Body() dto: DTO.CreatePasswordDTO,
  ): Promise<DTO.PasswordResponseDTO> {
    return await this.authApiService.createPasswordWithToken(dto);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PERMISSIONS.USER.PASSWORD.UPDATE, PERMISSIONS.ADMIN.ALL)
  @AuthDocs('changePassword')
  async changePassword(
    @Body() dto: DTO.UpdateUserPasswordDTO,
  ): Promise<DTO.PasswordResponseDTO> {
    return await this.authApiService.updatePassword(dto);
  }

  @Put('forgot-password')
  @ApiBasicAuth()
  @Version('1')
  @UseGuards(BasicAuthGuard)
  @AuthDocs('forgotPassword')
  async forgotPassword(
    @Body() dto: DTO.ForgotUserPasswordDTO,
  ): Promise<DTO.PasswordResponseDTO> {
    return await this.authApiService.forgotPassword(dto);
  }

  @Post('refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'), BasicAuthGuard)
  @Version('1')
  @AuthDocs('refreshToken')
  async refreshToken(
    @Req() req: IAuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<DTO.RefreshTokenResponseDTO> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No se provee el token.');
    }

    const { accessToken } =
      await this.authApiService.refreshAccessToken(refreshToken);
    this.cookieService.setAccessToken(res, accessToken);

    return { message: 'Token actualizado', accessToken };
  }

  @Get('scope')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Version('1')
  @AuthDocs('scope')
  async scope(@User() user: IUserDataOnJwt): Promise<DTO.UserScopeResponseDTO> {
    return this.authApiService.scope(user);
  }

  @Get('user-verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Version('1')
  @AuthDocs('userVerify')
  async userVerify(@User() user: Users): Promise<void> {
    return this.authApiService.userVerify(user);
  }

  @Get('verification-status')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @AuthDocs('verificationStatus')
  async userVerificationStatus(
    @Query() query: DTO.VerificationStatusQueryDTO,
    @User() user: Users,
  ): Promise<DTO.VerificationStatusResponseDTO> {
    return await this.authApiService.userVerificationStatus(user);
  }

  @Post('email/send-verification')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @AuthDocs('sendVerificationEmail')
  async sendVerificationEmail(
    @Body() dto: DTO.EmailSendRequestDTO,
    @User() user: Users,
  ): Promise<DTO.PasswordOnlyMessageResponseDTO> {
    await this.authApiService.sendVerificationEmail(dto.email, user);
    return { message: 'Email de verificación enviado correctamente.' };
  }

  @Post('email/send-create-password')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @AuthDocs('sendCreatePasswordEmail')
  async sendCreatePasswordEmail(
    @Body() dto: DTO.EmailSendRequestDTO,
    @User() user: Users,
  ): Promise<DTO.PasswordOnlyMessageResponseDTO> {
    await this.authApiService.sendPasswordCreationEmail(dto.email, user);
    return {
      message: 'Email para creación de contraseña enviado correctamente.',
    };
  }

  @Post('email/send-password-reset')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @AuthDocs('sendPasswordResetEmail')
  async sendPasswordResetEmail(
    @Body() dto: DTO.EmailSendRequestDTO,
    @User() user: Users,
  ): Promise<DTO.PasswordOnlyMessageResponseDTO> {
    await this.authApiService.sendPasswordResetEmail(dto.email, user);
    return {
      message: 'Email para recuperación de cuenta enviado correctamente.',
    };
  }
}
