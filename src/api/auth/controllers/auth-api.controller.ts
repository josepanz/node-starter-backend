import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Version,
  Put,
  Res,
  UseGuards,
  Req,
  HttpCode,
  Query,
  Logger,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBasicAuth,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthApiService } from '@api/auth/services/auth-api.service';
import { LoginUserDto } from '@api/auth/dtos/request/login-user.request.dto';
import { LoginUserResponseDto } from '@api/auth/dtos/response/login-user.response.dto';
import {
  IChangePasswordPayload,
  IForgotPasswordPayload,
  IPasswordPayload,
} from '@modules/auth/interfaces/jwt-payload.interface';
import { Response } from 'express';
import { UpdateUserPasswordDto } from '@api/auth/dtos/request/update-user-password.dto';
import { ForgotUserPasswordDto } from '@api/auth/dtos/request/forgot-user-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { IAuthenticatedRequest } from '@modules/auth/interfaces/authenticated-request.interface';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { Users } from '@prisma/client';
import { User } from '@common/decorators/user.decorator';
import { UserScopeResponseDto } from '@api/auth/dtos/response/user-scope.response.dto';
import { PermissionsEnum } from '@common/enum/permissions.enum';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';
import { UserByEmailLoaderGuard } from '@modules/auth/guards/user-by-email-loader.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthApiController {
  private readonly logger = new Logger(AuthApiController.name);
  constructor(private readonly authApiService: AuthApiService) {}

  @Post('login')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Login del usuario con hash dinámico y nonce.',
    description:
      'Login del usuario, si es primer login se importan sus datos y configuraciones.',
  })
  @ApiOkResponse({
    description: 'Usuario logueado exitosamente.',
    type: LoginUserResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'Contiene el refreshToken',
        schema: {
          type: 'string',
          example:
            'refreshToken=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIiLCJlbWFpbCI6Impvc2VwYW56YTFAZ21haWwuY29tIiwidG9rZW5UeXBlIjoicmVmcmVzaFRva2Vu; Max-Age=604800; Path=/; Expires=Wed, 17 Sep 2025 13:39:05 GMT; HttpOnly; Secure; SameSite=Strict',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuario bloqueado.',
    example: {
      statusCode: 403,
      message: 'Usuario bloqueado.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado.',
    example: {
      statusCode: 404,
      message: 'Usuario no encontrado.',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    example: {
      statusCode: 400,
      message:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserResponseDto> {
    const userAgent = req?.headers['user-agent'] as string;
    const data = await this.authApiService.handleLogin(dto, userAgent);

    // guardar refreshToken en cookie segura
    if (data.refreshToken) {
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: true, // true ya que se usa HTTPS
        sameSite: 'strict', // o 'lax'
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });
    }
    return {
      login: data.login,
      accessToken: data.accessToken,
      requiredNewPassword: data.requiredNewPassword,
    };
  }

  @Post('create-password')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Creación de credenciales y password del usuario.',
    description: 'Creación de credenciales y password del usuario.',
  })
  @ApiOkResponse({
    description: 'Credenciales creadas correctamente.',
    example: { success: true, message: 'Contraseña creada correctamente.' },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuario bloqueado.',
    example: {
      statusCode: 403,
      message: 'Usuario bloqueado.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado.',
    example: {
      statusCode: 404,
      message: 'Usuario no encontrado.',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    example: {
      statusCode: 400,
      message:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  async createPassword(
    @Body() dto: LoginUserDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.authApiService.createPassword({
      email: dto.email,
      password: dto.password,
    } as IPasswordPayload);
  }

  @Put('change-password')
  @ApiBearerAuth()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cambio de credenciales y password del usuario.',
    description: 'Cambio de credenciales y password del usuario.',
  })
  @ApiOkResponse({
    description: 'Credenciales actualizadas correctamente.',
    example: {
      success: true,
      message: 'Contraseña actualizada correctamente.',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuario bloqueado.',
    example: {
      statusCode: 403,
      message: 'Usuario bloqueado.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado.',
    example: {
      statusCode: 404,
      message: 'Usuario no encontrado.',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    example: {
      statusCode: 400,
      message:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(PermissionsEnum.USER_PASSWORD_UPDATE, PermissionsEnum.ADMIN_ALL)
  async changePassword(
    @Body() dto: UpdateUserPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.authApiService.updatePassword({
      email: dto.email,
      oldPassword: dto.oldPassword,
      newPassword: dto.newPassword,
    } as IChangePasswordPayload);
  }

  @Put('forgot-password')
  @ApiBearerAuth()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Olvide mi contraseña. Cambio de credenciales y password del usuario.',
    description:
      'Olvide mi contraseña. Cambio de credenciales y password del usuario.',
  })
  @ApiOkResponse({
    description: 'Credenciales actualizadas correctamente.',
    example: {
      success: true,
      message: 'Contraseña actualizada correctamente.',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  @ApiForbiddenResponse({
    description: 'Usuario bloqueado.',
    example: {
      statusCode: 403,
      message: 'Usuario bloqueado.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado.',
    example: {
      statusCode: 404,
      message: 'Usuario no encontrado.',
    },
  })
  @ApiBadRequestResponse({
    description:
      'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    example: {
      statusCode: 400,
      message:
        'Solicitud mal formada, verifique los datos y/o parametros enviados.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @UseGuards(JwtAuthGuard)
  async forgotPassword(
    @Body() dto: ForgotUserPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    return await this.authApiService.forgotPassword({
      email: dto.email,
      newPassword: dto.newPassword,
      confirmPassword: dto.confirmPassword,
    } as IForgotPasswordPayload);
  }

  @Post('refresh-token')
  @UseGuards(JwtAuthGuard, AuthGuard('jwt-refresh'), BasicAuthGuard)
  @ApiBearerAuth()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refresca el token de acceso usando el token de refresco.',
    description:
      'Endpoint para obtener un nuevo token de acceso a partir de un token de refresco válido. El token de refresco debe ser enviado en una cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens de acceso y refresco renovados con éxito.',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRlbW8iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2gY-l-E0B1eEw-1rT1-a1Xz',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Token de refresco inválido o expirado.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  async refreshToken(@Req() req: IAuthenticatedRequest, @User() user: Users) {
    const refreshToken = req?.cookies?.refreshToken as string;
    const userAgent = req?.headers['user-agent'] as string;
    const { accessToken } = await this.authApiService.refreshAccessToken({
      email: user.email,
      refreshToken,
      userAgent,
    });

    return { accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard, AuthGuard('jwt-refresh'))
  @ApiBearerAuth()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Cierra la sesión del usuario.',
    description:
      'Revoca el token de refresco, invalidando la sesión en el dispositivo actual. El token de refresco debe ser enviado en una cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada con éxito.',
    example: { message: 'Sesión cerrada con éxito.' },
  })
  @ApiUnauthorizedResponse({
    description: 'Token de refresco inválido o expirado.',
    type: UnauthorizedException,
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas.',
    },
  })
  async logout(@Req() req: IAuthenticatedRequest) {
    const refreshToken = req.cookies.refreshToken as string;
    await this.authApiService.logout(refreshToken);

    return { message: 'Sesión cerrada con éxito.' };
  }

  @Get('scope')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obtiene el scope del usuario.',
    description:
      'Obtiene el scope del usuario, sus role, rolePermissions y userPermissions asignados.',
  })
  @ApiOkResponse({
    description: 'Scope del usuario obtenido con éxito.',
    type: UserScopeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de acceso inválido o expirado.',
    example: {
      statusCode: 401,
      message: 'Token de acceso inválido o expirado.',
    },
  })
  @ApiNotFoundResponse({
    description: 'El usuario no tiene roles ni permisos asignados.',
    example: {
      statusCode: 404,
      message: 'El usuario no tiene roles ni permisos asignados.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  async scope(@User() user: Users) {
    return await this.authApiService.scope(user);
  }

  @Get('user-verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verifica el email del usuario.',
    description:
      'Verifica el email del usuario y lo activa para que asi tenga acceso a las acciones del sistema.',
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario verificado con exito.',
  })
  @ApiUnauthorizedResponse({
    description: 'Token temporal inválido o expirado.',
    example: {
      statusCode: 401,
      message: 'Token temporal inválido o expirado.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado.',
    example: {
      statusCode: 404,
      message: 'Usuario no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  async userVerify(@User() user: Users) {
    return await this.authApiService.userVerify(user);
  }

  @Get('verification-status')
  @Version('1')
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard, UserByEmailLoaderGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Consulta el estado de verificación del email del usuario.',
    description:
      'Endpoint para consultar si un email ya ha sido verificado. Usado para polling en flujos de verificación cross-device.',
  })
  @ApiOkResponse({
    description: 'Estado de verificación consultado exitosamente.',
    example: {
      verified: true,
      email: 'user@example.com',
    },
  })
  @ApiBadRequestResponse({
    description: 'Email requerido.',
    example: {
      statusCode: 400,
      message: 'Email es requerido.',
    },
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado.',
    example: {
      statusCode: 404,
      message: 'Usuario no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  userVerificationStatus(
    @Query('email') email: string,
    @User() user: Users,
  ): { verified: boolean; email: string } {
    this.logger.log(`Validación de usuario ${email}`);
    return this.authApiService.userVerificationStatus(user);
  }
}
