import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  HttpCode,
  Version,
  UseGuards,
  ParseIntPipe,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesService } from '../services/roles.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { RoleResponseDto } from '@api/roles/dtos/response/role.response.dto';
import { CreateRoleRequestDto } from '@api/roles/dtos/request/create-role.request.dto';
import { UpdateRoleRequestDto } from '@api/roles/dtos/request/update-role.request.dto';
import { Users } from '@prisma/client';
import { User } from '@common/decorators/user.decorator';
import { PermissionsEnum } from '@common/enum/permissions.enum';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Version('1')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un nuevo rol en el sistema. Solo para administradores.',
  })
  @ApiResponse({
    status: 201,
    description: 'El rol ha sido creado exitosamente.',
    type: RoleResponseDto,
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
  @Permissions(PermissionsEnum.ROLE_CREATE, PermissionsEnum.ADMIN_ALL)
  async create(
    @Body() dto: CreateRoleRequestDto,
    @User() user: Users,
  ): Promise<RoleResponseDto> {
    return await this.rolesService.create(dto, user.email);
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
    type: RoleResponseDto,
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
    description: 'Rol no encontrado.',
    example: {
      statusCode: 404,
      message: 'Rol no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.ROLE_UPDATE, PermissionsEnum.ADMIN_ALL)
  async update(
    @Body() dto: UpdateRoleRequestDto,
    @User() user: Users,
  ): Promise<RoleResponseDto> {
    return await this.rolesService.update(dto, user.email);
  }

  @Get()
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obtener todos los roles',
    description:
      'Obtiene una lista de todos los roles disponibles. Solo para administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles obtenida exitosamente.',
    type: [RoleResponseDto],
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
    description: 'Rol no encontrado.',
    example: {
      statusCode: 404,
      message: 'Rol no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.ROLE_READ, PermissionsEnum.ADMIN_ALL)
  async findAll(): Promise<RoleResponseDto[]> {
    return await this.rolesService.findAll();
  }

  @Get(':id')
  @Version('1')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Obtener un rol por ID',
    description:
      'Obtiene los detalles de un rol específico por su ID. Solo para administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rol obtenido exitosamente.',
    type: RoleResponseDto,
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
    description: 'Rol no encontrado.',
    example: {
      statusCode: 404,
      message: 'Rol no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.ROLE_READ, PermissionsEnum.ADMIN_ALL)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoleResponseDto> {
    return await this.rolesService.findOne(id);
  }

  @Delete(':id')
  @Version('1')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar un rol por ID',
    description:
      'Elimina un rol específico por su ID. Solo para administradores.',
  })
  @ApiResponse({ status: 204, description: 'Rol eliminado exitosamente.' })
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
    description: 'Rol no encontrado.',
    example: {
      statusCode: 404,
      message: 'Rol no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(PermissionsEnum.ROLE_DELETE, PermissionsEnum.ADMIN_ALL)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: Users,
  ): Promise<void> {
    await this.rolesService.remove(id, user.email);
  }
}
