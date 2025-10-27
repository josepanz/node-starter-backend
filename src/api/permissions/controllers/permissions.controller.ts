import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Version,
  UseGuards,
  HttpCode,
  UnauthorizedException,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { PermissionsService } from '../services/permissions.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { PermissionResponseDto } from '@api/permissions/dtos/response/permission.response.dto';
import { Permissions } from '@common/decorators/permissions.decorator';
import { CreatePermissionRequestDto } from '@api/permissions/dtos/request/create-permission.request.dto';
import { User } from '@common/decorators/user.decorator';
import { Users } from '@prisma/client';
import { UpdatePermissionRequestDto } from '@api/permissions/dtos/request/update-permission.request.dto';
import { PermissionsEnum } from '@common/enum/permissions.enum';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Version('1')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un nuevo permiso',
    description:
      'Crea un nuevo permiso en el sistema. Requiere permiso de administrador.',
  })
  @ApiCreatedResponse({
    description: 'El permiso ha sido creado exitosamente.',
    type: PermissionResponseDto,
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
  @Permissions(PermissionsEnum.PERMISSION_CREATE, PermissionsEnum.ADMIN_ALL) // Permisos para crear un permiso
  async create(
    @Body() createPermissionDto: CreatePermissionRequestDto,
    @User() user: Users,
  ): Promise<PermissionResponseDto | null> {
    return await this.permissionsService.create(
      createPermissionDto,
      user.email,
    );
  }

  @Put()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Actualza un rol',
    description: 'Actualiza un rol en el sistema. Solo para administradores.',
  })
  @ApiResponse({
    status: 201,
    description: 'El rol ha sido actualizado exitosamente.',
    type: PermissionResponseDto,
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
    description: 'Permiso no encontrado.',
    example: {
      statusCode: 404,
      message: 'Permiso no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.PERMISSION_UPDATE, PermissionsEnum.ADMIN_ALL)
  async update(
    @Body() dto: UpdatePermissionRequestDto,
    @User() user: Users,
  ): Promise<PermissionResponseDto> {
    return await this.permissionsService.update(dto, user.email);
  }

  @Get()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obtener todos los permisos',
    description:
      'Retorna una lista de todos los permisos. Accesible para todos los usuarios con el permiso de lectura.',
  })
  @ApiOkResponse({
    description: 'Permisos obtenidos exitosamente.',
    type: [PermissionResponseDto],
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
    description: 'Permisos no encontrados.',
    example: {
      statusCode: 404,
      message: 'Permisos no encontrados.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.PERMISSION_READ, PermissionsEnum.ADMIN_ALL) // Permisos para listar permisos
  async findAll(): Promise<PermissionResponseDto[] | null> {
    return await this.permissionsService.findAll();
  }

  @Get(':id')
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obtener un permiso por ID',
    description:
      'Retorna un permiso específico por su ID. Requiere permiso de lectura.',
  })
  @ApiOkResponse({
    description: 'Permiso obtenido exitosamente.',
    type: PermissionResponseDto,
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
    description: 'Permiso no encontrado.',
    example: {
      statusCode: 404,
      message: 'Permiso no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.PERMISSION_READ, PermissionsEnum.ADMIN_ALL)
  async findOne(
    @Param('id') id: number,
  ): Promise<PermissionResponseDto | null> {
    return await this.permissionsService.findOne(id);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar un permiso',
    description:
      'Elimina un permiso por su ID. Requiere permiso de administrador.',
  })
  @ApiNoContentResponse({
    description: 'El permiso ha sido eliminado exitosamente.',
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
    description: 'Permiso no encontrado.',
    example: {
      statusCode: 404,
      message: 'Permiso no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.PERMISSION_DELETE, PermissionsEnum.ADMIN_ALL)
  async remove(@Param('id') id: number): Promise<void> {
    await this.permissionsService.remove(id);
  }
}
