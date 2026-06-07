import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  AccessLevel,
  DocumentType,
  Prisma,
  UserProfileStatus,
  Users,
  UserStatus,
} from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { UserCredentialsWithUser } from '@modules/auth/types';
import {
  UserWithSecurities,
  userWithSecuritiesExtended,
  UserWithSecuritiesExtended,
} from '@modules/auth/types/user.types';
import { EmailService } from '@modules/email/services/email.service';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';
import { UpdateEditContextRequestDTO } from '@api/users/dtos';
import { UserRolesDBService } from './user-roles-db.service';
import { RoleDTO, PermissionDTO } from '../interfaces/users-db.interface';
import { UserWithDetail, userDetailInclude } from '../types/users-db.type';

@Injectable()
export class UsersDBService {
  private readonly logger = new Logger(UsersDBService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly emailService: EmailService,
    private readonly userRolesDBService: UserRolesDBService,
  ) {}

  // ─── Create ──────────────────────────────────────────────────────────────

  async create(data: Prisma.UsersCreateInput): Promise<Users> {
    return await this.prisma.extended.users.create({ data });
  }

  async createUser(data: {
    email: string;
    firstName: string;
    lastName: string;
    documentNumber?: string;
    isEmployee: boolean;
    isLdap: boolean;
    status?: UserStatus;
    legacyUserId?: string;
    lastLogin?: Date;
    createdBy: string;
    currentAccessLevel?: AccessLevel;
    acceptedTermsAt?: Date;
  }): Promise<Users> {
    const existing = await this.findByEmailAndDocument(
      data.email,
      data.documentNumber || '',
    );

    if (existing) {
      throw new BadRequestException(
        `El usuario con el email ${data.email} ya existe.`,
      );
    }

    const created = await this.create(data);

    try {
      await this.emailService.sendEmailByType(
        data.email,
        EmailTypeEnum.VERIFICATION,
        created,
      );
    } catch (error) {
      this.logger.error(`Error enviando email de verificación: ${error}`);
    }

    return created;
  }

  async createUserWithContext(data: {
    email: string;
    firstName: string;
    lastName: string;
    documentNumber?: string;
    documentType?: DocumentType;
    phoneNumber?: string;
    isEmployee: boolean;
    isLdap: boolean;
    status: UserStatus;
    createdBy: string;
    currentAccessLevel?: AccessLevel;
    roleIds?: number[];
    merchantCtx?: {
      ruc: string;
      merchantCode: string;
      level: AccessLevel;
      branchCodes?: string[];
      groupingIds?: number[];
    };
  }): Promise<Users> {
    const existing = await this.findByEmailAndDocument(
      data.email,
      data.documentNumber || '',
    );

    if (existing) {
      throw new BadRequestException(
        `El usuario con el email ${data.email} ya existe.`,
      );
    }

    const created = await this.prisma.extended.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          documentNumber: data.documentNumber ?? null,
          documentType: data.documentType ?? DocumentType.CIP,
          phoneNumber: data.phoneNumber ?? null,
          isEmployee: data.isEmployee,
          isLdap: data.isLdap,
          status: data.status,
          createdBy: data.createdBy,
          currentAccessLevel: data.currentAccessLevel,
          profileStatus: UserProfileStatus.COMPLETE,
        },
      });

      if (data.roleIds?.length) {
        await this.userRolesDBService.replaceUserRoles(
          user.id,
          data.roleIds,
          data.createdBy,
          tx,
        );
      }

      return user;
    });

    try {
      await this.emailService.sendEmailByType(
        data.email,
        EmailTypeEnum.VERIFICATION,
        created,
      );
      await this.emailService.sendEmailByType(
        data.email,
        EmailTypeEnum.CREATE_PASSWORD,
        created,
      );
    } catch (error) {
      this.logger.error(`Error enviando email de verificación: ${error}`);
    }

    return created;
  }

  // ─── Find many ───────────────────────────────────────────────────────────

  async findAll(params: {
    page: number;
    pageSize: number;
    orderBy: string;
    orderDir?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    name?: string;
    email?: string;
    documentNumber?: string;
    status?: UserStatus;
    merchantCode?: string;
    currentAccessLevel?: AccessLevel;
    level?: AccessLevel;
    groupingId?: number;
    branchCode?: string;
    operatorReferenceId?: string;
  }): Promise<{ data: Users[]; total: number }> {
    const {
      page,
      pageSize,
      orderBy,
      orderDir = 'desc',
      startDate,
      endDate,
      name,
      email,
      documentNumber,
      status,
      currentAccessLevel,
      operatorReferenceId,
    } = params;

    const skip = (page - 1) * pageSize;
    const ilike = Prisma.QueryMode.insensitive;

    const createdAt: Prisma.DateTimeFilter | undefined =
      startDate || endDate
        ? {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          }
        : undefined;

    const nameFilter = name
      ? name
          .trim()
          .split(/\s+/)
          .map((term) => ({
            OR: [
              { firstName: { contains: term, mode: ilike } },
              { lastName: { contains: term, mode: ilike } },
            ],
          }))
      : undefined;

    const where: Prisma.UsersWhereInput = {
      status: status ? { equals: status } : undefined,
      createdAt,
      AND: nameFilter,
      email: email ? { contains: email, mode: ilike } : undefined,
      documentNumber: documentNumber
        ? { contains: documentNumber, mode: ilike }
        : undefined,
      currentAccessLevel:
        currentAccessLevel && currentAccessLevel !== AccessLevel.COMMERCE
          ? { equals: currentAccessLevel }
          : undefined,
      referenceId: { not: operatorReferenceId },
    };

    const [data, total] = await this.prisma.extended.$transaction([
      this.prisma.extended.users.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [orderBy]: orderDir },
      }),
      this.prisma.extended.users.count({ where }),
    ]);

    return { data, total };
  }

  async findAllUsers(params: {
    page: number;
    pageSize: number;
    orderBy: string;
    orderDir?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    name?: string;
    email?: string;
    documentNumber?: string;
    status?: UserStatus;
    merchantCode?: string;
    currentLevel?: AccessLevel;
    level?: AccessLevel;
    groupingId?: number;
    branchCode?: string;
    operatorReferenceId?: string;
  }): Promise<{ data: Users[]; total: number }> {
    return this.findAll(params);
  }

  // ─── Find one ────────────────────────────────────────────────────────────

  async findById(id: number): Promise<Users | null> {
    return await this.prisma.extended.users.findUnique({ where: { id } });
  }

  async findUserById(id: number): Promise<Users> {
    const user = await this.findById(id);
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return user;
  }

  async findByIdWithDetail(id: number): Promise<UserWithDetail | null> {
    return await this.prisma.extended.users.findUnique({
      where: { id },
      include: userDetailInclude,
    });
  }

  async findUserByIdWithDetail(id: number): Promise<UserWithDetail> {
    const user = await this.findByIdWithDetail(id);
    if (!user)
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    return user;
  }

  async findByReferenceId(referenceId: string): Promise<Users | null> {
    return await this.prisma.extended.users.findUnique({
      where: { referenceId },
    });
  }

  async findUserByReferenceId(referenceId: string): Promise<Users> {
    const user = await this.findByReferenceId(referenceId);
    if (!user) throw new NotFoundException(`Usuario no encontrado.`);
    return user;
  }

  async findByReferenceIdWithDetail(
    referenceId: string,
  ): Promise<UserWithDetail | null> {
    return await this.prisma.extended.users.findUnique({
      where: { referenceId },
      include: userDetailInclude,
    });
  }

  async findUserByReferenceIdWithDetail(
    referenceId: string,
  ): Promise<UserWithDetail> {
    const user = await this.findByReferenceIdWithDetail(referenceId);
    if (!user) throw new NotFoundException(`Usuario no encontrado.`);
    return user;
  }

  async findByEmail(email: string): Promise<Users | null> {
    return await this.prisma.extended.users.findUnique({ where: { email } });
  }

  async findUserByEmail(email: string): Promise<Users | null> {
    return this.findByEmail(email);
  }

  async findByEmailAndDocument(
    email: string,
    documentNumber: string,
  ): Promise<Users | null> {
    return await this.prisma.extended.users.findFirst({
      where: { email, documentNumber },
    });
  }

  async findActiveUserByEmail(
    email: string,
  ): Promise<UserWithSecurities | null> {
    return await this.prisma.extended.users.findFirst({
      where: {
        email,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION] },
      },
      include: {
        roles: true,
        permissions: true,
        credentials: true,
      },
    });
  }

  async findActiveUserById(id: number): Promise<Users | null> {
    return await this.prisma.extended.users.findFirst({
      where: {
        id,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION] },
      },
    });
  }

  async findCredentialsByEmail(
    email: string,
  ): Promise<UserCredentialsWithUser | null> {
    return await this.prisma.extended.userCredentials.findFirst({
      where: { isActive: true, user: { email } },
      include: {
        user: {
          include: { roles: true, permissions: true, credentials: true },
        },
      },
    });
  }

  async findActiveUserByEmailWithPermissions(
    email: string,
  ): Promise<UserWithSecuritiesExtended | null> {
    return (await this.prisma.extended.users.findFirst({
      where: {
        email,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION] },
      },
      include: userWithSecuritiesExtended.include,
    })) as UserWithSecuritiesExtended;
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  async update(id: number, data: Prisma.UsersUpdateInput): Promise<Users> {
    return await this.prisma.extended.users.update({ where: { id }, data });
  }

  async updateUser(
    id: number,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      documentNumber?: string;
      phoneNumber?: string;
      isEmployee?: boolean;
      isLdap?: boolean;
      status?: UserStatus;
      changedReason?: string;
    },
    updatedBy: string,
  ): Promise<Users> {
    await this.findUserById(id);

    return await this.update(id, {
      ...data,
      lastChangedBy: updatedBy,
      lastChangedAt: new Date(),
      changedReason:
        data.changedReason ??
        (data.status === UserStatus.BLOCKED
          ? 'Cantidad de intentos fallidos superado'
          : undefined),
    });
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.prisma.extended.users.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  async updateStatus(userId: number, status: UserStatus): Promise<void> {
    await this.prisma.extended.users.update({
      where: { id: userId },
      data: { status },
    });
  }

  async verifyUser(userId: number): Promise<void> {
    await this.prisma.extended.users.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE, unverifiedEmail: null },
    });
  }

  async blockUser(id: number, reason: string): Promise<void> {
    await this.prisma.extended.users.update({
      where: { id },
      data: {
        status: UserStatus.BLOCKED,
        lastChangedAt: new Date(),
        changedReason: reason,
      },
    });
  }

  async inactivate(id: number, deletedBy: string): Promise<void> {
    await this.prisma.extended.users.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
        lastChangedBy: deletedBy,
        lastChangedAt: new Date(),
        changedReason: `Eliminado por ${deletedBy}`,
      },
    });
  }

  async inactivateUser(id: number, deletedBy: string): Promise<void> {
    await this.findUserById(id);
    await this.inactivate(id, deletedBy);
  }

  // ─── Roles y permisos ────────────────────────────────────────────────────

  async getUserRoles(userId: number): Promise<RoleDTO[]> {
    const userRoles = await this.prisma.extended.userRoles.findMany({
      where: { userId, role: { isActive: true } },
      include: {
        role: { select: { id: true, name: true, description: true } },
      },
    });

    return userRoles.map(
      (ur): RoleDTO => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      }),
    );
  }

  async getUserPermissions(userId: number): Promise<PermissionDTO[]> {
    const userPermissions = await this.prisma.extended.userPermissions.findMany(
      {
        where: { userId, permission: { isActive: true } },
        include: { permission: { select: { name: true } } },
      },
    );

    return userPermissions.map(
      (up): PermissionDTO => ({ name: up.permission.name }),
    );
  }

  async getRolePermissions(roleIds: number[]): Promise<PermissionDTO[]> {
    if (roleIds.length === 0) return [];

    const rolePermissions = await this.prisma.extended.rolePermissions.findMany(
      {
        where: { roleId: { in: roleIds }, permission: { isActive: true } },
        include: { permission: { select: { name: true } } },
      },
    );

    const unique = new Map<string, PermissionDTO>();
    rolePermissions.forEach((rp) => {
      if (!unique.has(rp.permission.name)) {
        unique.set(rp.permission.name, { name: rp.permission.name });
      }
    });

    return Array.from(unique.values());
  }

  // ─── Context update (transaction) ────────────────────────────────────────

  async updateUserWithContext(
    user: Users,
    dto: UpdateEditContextRequestDTO,
    operatorUserEmail: string,
  ): Promise<void> {
    await this.prisma.extended.$transaction(async (tx) => {
      if (dto.user) {
        await tx.users.update({
          where: { id: user.id },
          data: {
            firstName: dto.user.firstName,
            lastName: dto.user.lastName,
            email: dto.user.email,
            documentNumber: dto.user.documentNumber ?? null,
            isEmployee: dto.user.isEmployee,
            isLdap: dto.user.isLdap,
            status: dto.user.status,
            changedReason: dto.user.changedReason ?? null,
            lastChangedBy: operatorUserEmail,
            lastChangedAt: new Date(),
          },
        });
      }

      if (dto.roleIds !== undefined) {
        await this.userRolesDBService.replaceUserRoles(
          user.id,
          dto.roleIds,
          operatorUserEmail,
          tx,
        );
      }
    });
  }
}
