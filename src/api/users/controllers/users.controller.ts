import { Users } from '@prisma/client';
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Put,
  Query,
  Version,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { RateLimit } from '@core/rate-limit/rate-limit.decorators';
import { UsersApiService } from '@api/users/services/users-api.service';
import * as DTO from '@api/users/dtos';
import { UsersDocs } from '@api/users/docs/users-api.docs';

import { PermissionsGuard } from '@modules/auth/guards/permissions.guard';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { TenantContextGuard } from '@modules/auth/guards/tenant-context.guard';
import { Permissions } from '@common/decorators/permissions.decorator';
import { User } from '@common/decorators/user.decorator';
import { TenantContext } from '@modules/auth/decorators/get-tenant-context.decorator';
import { ITenantContext } from '@common/interfaces/tenant-context.interface';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { UpdateEditContextRequestDTO } from '@modules/users-db/dtos/edit-context.request.dto';
import {
  GetEditContextResponseDTO,
  UpdateEditContextResponseDTO,
} from '@api/users/dtos/response/edit-context.response.dto';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersApiService: UsersApiService) {}

  @Get()
  @Version('1')
  @RateLimit('search')
  @UseGuards(TenantContextGuard)
  @Permissions(PERMISSIONS.USER.READ)
  @UsersDocs('findAll')
  async findAll(
    @Query() query: DTO.ListUsersRequestDTO,
    @TenantContext() tenantCtx: ITenantContext,
    @User() user: IUserDataOnJwt,
  ): Promise<DTO.UsersListResponseDTO> {
    return await this.usersApiService.findAll(query, tenantCtx, user);
  }

  @Get('reference/:referenceId/edit-context')
  @Version('1')
  @UseGuards(TenantContextGuard)
  @Permissions(PERMISSIONS.USER.READ)
  @UsersDocs('getEditContext')
  async getEditContext(
    @Param('referenceId') referenceId: string,
  ): Promise<GetEditContextResponseDTO> {
    return await this.usersApiService.getEditContext(referenceId);
  }

  @Put('reference/:referenceId/edit-context')
  @Version('1')
  @UseGuards(TenantContextGuard)
  @Permissions(PERMISSIONS.USER.UPDATE)
  @UsersDocs('updateEditContext')
  async updateEditContext(
    @Param('referenceId') referenceId: string,
    @Body() dto: UpdateEditContextRequestDTO,
    @User() operatorUser: Users,
  ): Promise<UpdateEditContextResponseDTO> {
    return await this.usersApiService.updateEditContext(
      referenceId,
      dto,
      operatorUser,
    );
  }

  @Get('reference/:referenceId')
  @Version('1')
  @UseGuards(TenantContextGuard)
  @Permissions(PERMISSIONS.USER.READ)
  @UsersDocs('findOneByReference')
  async findOneByReference(
    @Param('referenceId') referenceId: string,
  ): Promise<DTO.UserResponseDTO> {
    return await this.usersApiService.findOneByReference(referenceId);
  }

  @Put('reference/:referenceId')
  @Version('1')
  @Permissions(PERMISSIONS.USER.UPDATE)
  @UsersDocs('updateByReference')
  async updateByReference(
    @Param('referenceId') referenceId: string,
    @Body() dto: DTO.UpdateUserRequestDTO,
    @User() user: Users,
  ): Promise<DTO.UserResponseDTO> {
    return await this.usersApiService.updateByReference(
      referenceId,
      dto,
      user.email,
    );
  }

  @Delete('reference/:referenceId')
  @Version('1')
  @Permissions(PERMISSIONS.USER.DELETE)
  @UsersDocs('deleteByReference')
  async deleteByReference(
    @Param('referenceId') referenceId: string,
    @User() user: Users,
  ): Promise<void> {
    await this.usersApiService.deleteByReference(referenceId, user.email);
  }

  @Get(':id')
  @Version('1')
  @UseGuards(TenantContextGuard)
  @Permissions(PERMISSIONS.USER.READ)
  @UsersDocs('findOne')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DTO.UserResponseDTO> {
    return await this.usersApiService.findOne(id);
  }

  @Put(':id')
  @Version('1')
  @Permissions(PERMISSIONS.USER.UPDATE)
  @UsersDocs('update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DTO.UpdateUserRequestDTO,
    @User() user: Users,
  ): Promise<DTO.UserResponseDTO> {
    return await this.usersApiService.update(id, dto, user.email);
  }

  @Patch(':id/block')
  @Version('1')
  @Permissions(PERMISSIONS.USER.UPDATE)
  @UsersDocs('block')
  async block(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DTO.BlockUserRequestDTO,
    @User() user: Users,
  ): Promise<DTO.UserResponseDTO> {
    return await this.usersApiService.block(id, dto, user.email);
  }

  @Patch(':id/unblock')
  @Version('1')
  @Permissions(PERMISSIONS.USER.UPDATE)
  @UsersDocs('unblock')
  async unblock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DTO.UnblockUserRequestDTO,
    @User() user: Users,
  ): Promise<DTO.UserResponseDTO> {
    return await this.usersApiService.unblock(id, dto, user.email);
  }
}
