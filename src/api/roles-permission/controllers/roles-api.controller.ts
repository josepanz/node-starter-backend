import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Version,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import * as RequestDTO from '@api/roles-permission/dtos/request';
import * as ResponseDTO from '@api/roles-permission/dtos/response';

import { JwtAuthGuard } from '@modules/auth/guards';

import { RolesApiService } from '@api/roles-permission/services/roles-permission-api.service';
import { RolesDocs } from '@api/roles-permission/docs';
import { GetUser } from '@modules/auth/decorators';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { Permissions } from '@common/decorators/permissions.decorator';

@ApiTags('Roles')
@Controller('roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RolesApiController {
  constructor(private readonly rolesApiService: RolesApiService) {}

  @Post()
  @Version('1')
  @RolesDocs('createRole')
  @Permissions(PERMISSIONS.ROLE.CREATE, PERMISSIONS.ADMIN.ALL)
  async createRole(
    @Body() dto: RequestDTO.CreateRoleRequestDTO,
    @GetUser('email') userEmail: string,
  ): Promise<ResponseDTO.RoleResponseDTO> {
    return await this.rolesApiService.createRole(dto, userEmail);
  }

  @Get()
  @Version('1')
  @RolesDocs('getAllRoles')
  @Permissions(PERMISSIONS.ROLE.READ, PERMISSIONS.ADMIN.ALL)
  async getAllRoles(
    @Query() queryDTO: RequestDTO.GetRoleListQueryDTO,
  ): Promise<ResponseDTO.RoleListResponseDTO> {
    return await this.rolesApiService.getAllRoles(queryDTO);
  }

  @Get(':id')
  @Version('1')
  @RolesDocs('getRoleById')
  @Permissions(PERMISSIONS.ROLE.READ, PERMISSIONS.ADMIN.ALL)
  async getRoleById(
    @Param() paramDTO: RequestDTO.GetRoleParamDTO,
  ): Promise<ResponseDTO.RoleResponseDTO> {
    return await this.rolesApiService.getRoleById(paramDTO.id);
  }

  @Put(':id')
  @Version('1')
  @RolesDocs('updateRole')
  @Permissions(PERMISSIONS.ROLE.UPDATE, PERMISSIONS.ADMIN.ALL)
  async updateRole(
    @Param() paramDTO: RequestDTO.GetRoleParamDTO,
    @Body() dto: RequestDTO.UpdateRoleRequestDTO,
  ): Promise<ResponseDTO.RoleResponseDTO> {
    return await this.rolesApiService.updateRole(paramDTO.id, dto, 'system');
  }
}
