import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Version,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import * as RequestDTO from '@api/roles-permission/dtos/request';
import * as ResponseDTO from '@api/roles-permission/dtos/response';

import { RolesApiService } from '@api/roles-permission/services/roles-permission-api.service';
import { UserRolesDocs } from '@api/roles-permission/docs';
import { JwtAuthGuard } from '@modules/auth/guards';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { Permissions } from '@common/decorators/permissions.decorator';

@ApiTags('User Roles & Permissions')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UsersRolesApiController {
  constructor(private readonly rolesApiService: RolesApiService) {}

  @Post(':userId/roles')
  @Version('1')
  @UserRolesDocs('assignRolesToUser')
  @Permissions(PERMISSIONS.ASSIGNMENT.ROLE_PERMISSION, PERMISSIONS.ADMIN.ALL)
  async assignRolesToUser(
    @Param() paramDTO: RequestDTO.GetUserRoleParamDTO,
    @Body() dto: RequestDTO.AssignRolesToUserRequestDTO,
  ): Promise<ResponseDTO.UserRoleAssignmentResponseDTO> {
    return await this.rolesApiService.assignRolesToUser(
      paramDTO.userId,
      dto,
      'system',
    );
  }

  @Get(':userId/roles')
  @Version('1')
  @UserRolesDocs('getUserWithRoles')
  @Permissions(
    PERMISSIONS.USER.READ,
    PERMISSIONS.ROLE.READ,
    PERMISSIONS.ADMIN.ALL,
  )
  async getUserWithRoles(
    @Param() paramDTO: RequestDTO.GetUserRoleParamDTO,
  ): Promise<ResponseDTO.UserWithRolesResponseDTO> {
    return await this.rolesApiService.getUserWithRoles(paramDTO.userId);
  }

  @Post(':userId/permissions')
  @Version('1')
  @UserRolesDocs('assignPermissionsToUser')
  @Permissions(PERMISSIONS.ASSIGNMENT.USER_PERMISSION, PERMISSIONS.ADMIN.ALL)
  async assignPermissionsToUser(
    @Param() paramDTO: RequestDTO.GetUserRoleParamDTO,
    @Body() dto: RequestDTO.AssignPermissionsToUserRequestDTO,
  ): Promise<ResponseDTO.UserPermissionAssignmentResponseDTO> {
    return await this.rolesApiService.assignPermissionsToUser(
      paramDTO.userId,
      dto,
      'system',
    );
  }
}
