import {
  Controller,
  Post,
  Body,
  HttpCode,
  Version,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionsAssignmentService } from '../services/permissions-assignment.service';
import { Permissions } from '@common/decorators/permissions.decorator';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { PermissionAssignedResponseDto } from '@api/permissions/dtos/response/permission-assignment.response.dto';
import { AssignPermissionToRoleRequestDto } from '@api/permissions/dtos/request/assign-permission-to-role-dto.request';
import { AssignPermissionToUserRequestDto } from '@api/permissions/dtos/request/assign-permission-to-user.request.dto';
import { User } from '@common/decorators/user.decorator';
import { Users } from '@prisma/client';
import { PermissionsEnum } from '@common/enum/permissions.enum';

@ApiTags('Permissions-assignment')
@Controller('permissions/assign')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsAssignmentController {
  constructor(
    private readonly permissionsAssignmentService: PermissionsAssignmentService,
  ) {}

  @Post('role')
  @Version('1')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Asignar un permiso a un rol',
    description:
      'Asigna un permiso específico a un rol. Solo para administradores.',
  })
  @ApiCreatedResponse({
    description: 'El permiso ha sido asignado al rol exitosamente.',
    type: PermissionAssignedResponseDto,
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
    description: 'Permiso o rol no encontrado.',
    example: {
      statusCode: 404,
      message: 'Permiso o rol no encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(
    PermissionsEnum.ROLE_PERMISSION_ASSIGNMENT_CREATE,
    PermissionsEnum.ADMIN_ALL,
  )
  async assignPermissionToRole(
    @Body() dto: AssignPermissionToRoleRequestDto,
    @User() user: Users,
  ): Promise<PermissionAssignedResponseDto | null> {
    return await this.permissionsAssignmentService.assignPermissionToRole(
      dto,
      user.email,
    );
  }

  @Delete('role/:roleId/:permissionId')
  @Version('1')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Desasignar un permiso de un rol',
    description:
      'Elimina la asignación de un permiso de un rol. Solo para administradores.',
  })
  @ApiNoContentResponse({
    description: 'El permiso ha sido desasignado del rol exitosamente.',
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
    description: 'Asignacion no encontrada.',
    example: {
      statusCode: 404,
      message: 'Asignacionno encontrado.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(
    PermissionsEnum.ROLE_PERMISSION_UNASSIGNMENT_DELETE,
    PermissionsEnum.ADMIN_ALL,
  )
  async unassignPermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @User() user: Users,
  ): Promise<void> {
    await this.permissionsAssignmentService.unassignPermissionFromRole(
      roleId,
      permissionId,
      user.email,
    );
  }

  @Post('user')
  @Version('1')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Asignar un permiso a un usuario',
    description:
      'Asigna un permiso específico a un usuario. Solo para administradores.',
  })
  @ApiCreatedResponse({
    description: 'El permiso ha sido asignado al usuario exitosamente.',
    type: PermissionAssignedResponseDto,
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
    description: 'Asignacion no encontrada.',
    example: {
      statusCode: 404,
      message: 'Asignacion no encontrada.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(
    PermissionsEnum.USER_PERMISSION_ASSIGNMENT_CREATE,
    PermissionsEnum.ADMIN_ALL,
  )
  async assignPermissionToUser(
    @Body() dto: AssignPermissionToUserRequestDto,
    @User() user: Users,
  ): Promise<PermissionAssignedResponseDto | null> {
    return await this.permissionsAssignmentService.assignPermissionToUser(
      dto,
      user.email,
    );
  }

  @Delete('user/:userId/:permissionId')
  @Version('1')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Desasignar un permiso de un usuario',
    description:
      'Elimina la asignación de un permiso de un usuario. Solo para administradores.',
  })
  @ApiNoContentResponse({
    description: 'El permiso ha sido desasignado del usuario exitosamente.',
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
    description: 'Asignacion no encontrada.',
    example: {
      statusCode: 404,
      message: 'Asignacion no encontrada.',
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor al procesar la solicitud.',
    example: {
      statusCode: 500,
      message: 'Error interno del servidor al procesar la solicitud.',
    },
  })
  @Permissions(
    PermissionsEnum.USER_PERMISSION_UNASSIGNMENT_DELETE,
    PermissionsEnum.ADMIN_ALL,
  )
  async unassignPermissionFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @User() user: Users,
  ): Promise<void> {
    await this.permissionsAssignmentService.unassignPermissionFromUser(
      userId,
      permissionId,
      user.email,
    );
  }
}
