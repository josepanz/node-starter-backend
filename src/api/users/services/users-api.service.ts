import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { UpdateUserRequestDTO } from '@api/users/dtos/request/update-user.request.dto';
import { ListUsersRequestDTO } from '@api/users/dtos/request/list-users.request.dto';
import { BlockUserRequestDTO } from '@api/users/dtos/request/block-user.request.dto';
import { UnblockUserRequestDTO } from '@api/users/dtos/request/unblock-user.request.dto';
import { UpdateEditContextRequestDTO } from '@api/users/dtos/request/edit-context.request.dto';
import {
  UserResponseDTO,
  UserDetailResponseDTO,
  UsersListResponseDTO,
} from '@api/users/dtos/response/user.response.dto';
import {
  EditContextRoleDTO,
  GetEditContextResponseDTO,
  UpdateEditContextResponseDTO,
} from '@api/users/dtos/response/edit-context.response.dto';
import { UsersDBService } from '@modules/users-db/services/users-db.service';
import { IMerchantContext } from '@common/interfaces/merchant-context.interface';
import { UserRolesDBService } from '@modules/users-db/services/user-roles-db.service';
import { UserHelper } from '../helpers/user.helper';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';

@Injectable()
export class UsersApiService {
  constructor(
    private readonly usersService: UsersDBService,
    private readonly userRolesDBService: UserRolesDBService,
  ) {}

  async findAll(
    dto: ListUsersRequestDTO,
    merchantCtx: IMerchantContext,
    user: IUserDataOnJwt,
  ): Promise<UsersListResponseDTO> {
    const page = Number(dto.page ?? 1);
    const pageSize = Number(dto.pageSize ?? 10);
    const orderBy = String(dto.orderBy ?? 'createdAt');
    const orderDir: 'asc' | 'desc' = dto.orderDir ?? 'desc';

    const { data, total } = await this.usersService.findAllUsers({
      page,
      pageSize,
      orderBy,
      orderDir,
      startDate: dto.startDate,
      endDate: dto.endDate,
      name: dto.name,
      email: dto.email,
      documentNumber: dto.documentNumber,
      status: dto.status,
      merchantCode: merchantCtx.merchantCode,
      currentLevel: merchantCtx.level,
      level: merchantCtx.level,
      groupingId: merchantCtx.groupingId,
      branchCode: merchantCtx.branchCode,
      operatorReferenceId: user.referenceId,
    });

    return {
      data: data.map((user) => UserHelper.mapUserToResponse(user)),
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number): Promise<UserDetailResponseDTO> {
    const user = await this.usersService.findUserByIdWithDetail(id);

    return UserHelper.mapUserToDetailResponse(user);
  }

  async findOneByReference(
    referenceId: string,
  ): Promise<UserDetailResponseDTO> {
    const user =
      await this.usersService.findUserByReferenceIdWithDetail(referenceId);

    return UserHelper.mapUserToDetailResponse(user);
  }

  async getEditContext(
    referenceId: string,
  ): Promise<GetEditContextResponseDTO> {
    const user =
      await this.usersService.findUserByReferenceIdWithDetail(referenceId);

    const [assignedRoleIds, availableRoles] = await Promise.all([
      this.userRolesDBService.getUserRoleIds(user.id),
      this.userRolesDBService.getAllAvailableRoles(),
    ]);

    const assignedRoles: EditContextRoleDTO[] = availableRoles
      .filter((r) => assignedRoleIds.includes(r.id))
      .map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description,
      }));

    const unassignedRoles: EditContextRoleDTO[] = availableRoles
      .filter((r) => !assignedRoleIds.includes(r.id))
      .map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description,
      }));

    return {
      user: {
        id: user.id,
        referenceId: user.referenceId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        documentNumber: user.documentNumber,
        phoneNumber: user.phoneNumber,
        status: user.status,
        isEmployee: user.isEmployee,
        isLdap: user.isLdap,
        changedReason: user.changedReason,
      },
      roles: {
        assigned: assignedRoles,
        available: unassignedRoles,
      },
    };
  }

  async updateEditContext(
    referenceId: string,
    dto: UpdateEditContextRequestDTO,
    operatorUser: { email: string },
  ): Promise<UpdateEditContextResponseDTO> {
    const user =
      await this.usersService.findUserByReferenceIdWithDetail(referenceId);

    await this.usersService.updateUserWithContext(
      user,
      dto,
      operatorUser.email,
    );
    return { message: 'Usuario actualizado correctamente' };
  }

  async update(
    id: number,
    dto: UpdateUserRequestDTO,
    updatedBy: string,
  ): Promise<UserResponseDTO> {
    const user = await this.usersService.updateUser(
      id,
      {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentNumber: dto.documentNumber,
        phoneNumber: dto.phoneNumber,
        isEmployee: dto.isEmployee,
        isLdap: dto.isLdap,
        status: dto.status,
        changedReason: dto.changedReason,
      },
      updatedBy,
    );

    return UserHelper.mapUserToResponse(user);
  }

  async updateByReference(
    referenceId: string,
    dto: UpdateUserRequestDTO,
    updatedBy: string,
  ): Promise<UserResponseDTO> {
    const user = await this.usersService.findUserByReferenceId(referenceId);

    const updated = await this.usersService.updateUser(
      user.id,
      {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        documentNumber: dto.documentNumber,
        phoneNumber: dto.phoneNumber,
        isEmployee: dto.isEmployee,
        isLdap: dto.isLdap,
        status: dto.status,
        changedReason: dto.changedReason,
      },
      updatedBy,
    );

    return UserHelper.mapUserToResponse(updated);
  }

  async deleteByReference(
    referenceId: string,
    deletedBy: string,
  ): Promise<void> {
    const user = await this.usersService.findUserByReferenceId(referenceId);
    await this.usersService.inactivateUser(user.id, deletedBy);
  }

  async block(
    id: number,
    dto: BlockUserRequestDTO,
    updatedBy: string,
  ): Promise<UserResponseDTO> {
    const user = await this.usersService.updateUser(
      id,
      {
        status: UserStatus.BLOCKED,
        changedReason: dto.reason,
      },
      updatedBy,
    );

    return UserHelper.mapUserToResponse(user);
  }

  async unblock(
    id: number,
    dto: UnblockUserRequestDTO,
    updatedBy: string,
  ): Promise<UserResponseDTO> {
    const user = await this.usersService.updateUser(
      id,
      {
        status: UserStatus.ACTIVE,
        changedReason: dto.reason,
      },
      updatedBy,
    );

    return UserHelper.mapUserToResponse(user);
  }
}
