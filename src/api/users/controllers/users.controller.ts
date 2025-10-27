import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseInterceptors,
  Version,
  UseGuards,
  Delete,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserRequestDto } from '../dtos/request/create-user.request.dto';
import { UpdateUserRequestDto } from '../dtos/request/update-user.request.dto';
import { Audit } from '@core/middlewares/decorators/audit.decorator';
import { AuditInterceptor } from '@core/middlewares/interceptors/audit.interceptor';
import { UserResponseDto } from '@api/users/dtos/response/user.response.dto';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { User } from '@common/decorators/user.decorator';
import { Users } from '@prisma/client';
import { PermissionsEnum } from '@common/enum/permissions.enum';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Version('1')
  @Audit('users')
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description: 'Registrar un nuevo usuario con datos proveidos',
  })
  @ApiCreatedResponse({
    description: 'Usuario creado satisfactoriamente',
    type: UserResponseDto,
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
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.USER_CREATE, PermissionsEnum.ADMIN_ALL)
  async create(
    @Body() dto: CreateUserRequestDto,
    @User() user: Users,
  ): Promise<UserResponseDto> {
    return await this.usersService.create(dto, user.email);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'Retorna un usuario especifico por su ID',
  })
  @ApiOkResponse({
    description: 'Usuario encontrado exitosamente',
    type: UserResponseDto,
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
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.USER_READ, PermissionsEnum.ADMIN_ALL)
  async findOne(@Param('id') id: number): Promise<UserResponseDto | null> {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  @Version('1')
  @Audit('users')
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description:
      'Actualiza los datos del usuario según el ID proporcionado y los nuevos valores',
  })
  @ApiOkResponse({
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
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
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.USER_UPDATE, PermissionsEnum.ADMIN_ALL)
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateUserRequestDto,
    @User() user: Users,
  ): Promise<UserResponseDto> {
    return await this.usersService.update(id, dto, user.email);
  }

  @Delete(':id')
  @Version('1')
  @Audit('users')
  @UseInterceptors(AuditInterceptor)
  @ApiOperation({
    summary: 'Actualizar un usuario',
    description:
      'Actualiza los datos del usuario según el ID proporcionado y los nuevos valores',
  })
  @ApiOkResponse({
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
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
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.USER_DELETE, PermissionsEnum.ADMIN_ALL)
  async delete(@Param('id') id: number, @User() user: Users): Promise<void> {
    await this.usersService.inactive(id, user.email);
  }
}
