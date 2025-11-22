import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaDatasource } from '../../../core/database/services/prisma.service';
import { CreateUserRequestDto } from '../dtos/request/create-user.request.dto';
import { UpdateUserRequestDto } from '../dtos/request/update-user.request.dto';
import { UserCredentials, Users, UserStatus } from '@prisma/client';
import { UserResponseDto } from '@api/users/dtos/response/user.response.dto';
import { UserCredentialsWithUser } from '@modules/auth/types/user-credentials.types';
import { UserWithSecurities } from '@modules/auth/types/user.types';
import { EmailService } from '@modules/email/services/email.service';
import { AuditUserEnum } from '@common/enum/audit-user.enum';
import { UserHelper } from '@common/helpers/user.helper';
import { EmailTypeEnum } from '@modules/email/enum/email-type.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crea un nuevo usuario.
   * @param dto Datos del usuario a crear.
   * @param createdBy Email del usuario que realiza la inserción.
   * @returns Usuario creado mapeado a su DTO de respuesta.
   */
  async create(
    dto: CreateUserRequestDto,
    createdBy: string,
  ): Promise<UserResponseDto> {
    const createdUser = await this.prisma.users.create({
      data: {
        ...dto,
        createdBy: createdBy ?? AuditUserEnum.SYSTEM,
      },
    });

    await this.emailService.sendEmailByType(
      dto.email,
      EmailTypeEnum.VERIFICATION,
      createdUser,
    );

    return UserHelper.mapUserToResponse(createdUser);
  }

  /**
   * Busca un usuario por ID.
   * @param id ID del usuario a buscar.
   * @returns El usuario encontrado o lanza una excepción si no existe.
   */
  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      this.logger.warn(`Usuario con ID ${id} no encontrado.`);
      throw new NotFoundException(`Usuario con ID ${id} no encontrado.`);
    }
    return UserHelper.mapUserToResponse(user);
  }

  /**
   * Actualiza un usuario por ID.
   * @param id ID del usuario a modificar.
   * @param dto Datos a modificar.
   * @param updatedBy Usuario que realiza la modificación.
   * @returns Usuario modificado mapeado a su DTO de respuesta.
   */
  async update(
    id: number,
    dto: UpdateUserRequestDto,
    updatedBy?: string,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.prisma.users.update({
      where: { id },
      data: {
        ...dto,
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        lastChangedAt: new Date(),
        changedReason:
          dto.status === UserStatus.BLOCKED
            ? 'Cantidad de intentos fallidos superado'
            : (dto.changedReason ?? null),
      },
    });
    return UserHelper.mapUserToResponse(updatedUser);
  }

  /**
   * Inactivar un usuario por ID. Soft Delete. Delete lógico.
   * @param id ID del usuario a modificar.
   * @param updatedBy Usuario que realiza la modificación.
   * @returns Void - inactiva usuario.
   */
  async inactive(id: number, updatedBy?: string): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        lastChangedAt: new Date(),
        changedReason: 'Eliminado por ' + (updatedBy ?? AuditUserEnum.SYSTEM),
      },
    });
  }

  /**
   * Actualiza la fecha de último login de un usuario.
   * @param id ID del usuario a actualizar.
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        lastLogin: new Date(),
      },
    });
  }

  /**
   * Bloquea un usuario cambiando su estado a BLOCKED.
   * @param id ID del usuario a bloquear.
   */
  async blockUser(id: number): Promise<void> {
    await this.prisma.users.update({
      where: { id },
      data: {
        status: UserStatus.BLOCKED,
        lastChangedAt: new Date(),
        lastChangedBy: AuditUserEnum.SYSTEM,
        changedReason: 'Cantidad de intentos fallidos superado',
      },
    });
  }

  /**
   * Busca las credenciales activas de un usuario por su email.
   * @param email Email a buscar.
   * @returns Usuario con sus credenciales y asociaciones, o null si no existe.
   */
  async findCredentialByEmail(
    email: string,
  ): Promise<UserCredentialsWithUser | null> {
    return await this.prisma.userCredentials.findFirst({
      where: {
        isActive: true,
        user: {
          email,
        },
      },
      include: {
        user: {
          include: {
            roles: true,
            UserPermissions: true,
            credentials: true,
            refreshTokens: true,
          },
        },
      },
    });
  }

  /**
   * Busca un usuario activo por su email.
   * @param email Email a buscar.
   * @returns Usuario activo con el email indicado o null si no existe.
   */
  async findActiveUserByEmail(
    email: string,
  ): Promise<UserWithSecurities | null> {
    return await this.prisma.users.findFirst({
      where: {
        email,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION] },
      },
      include: {
        roles: true,
        UserPermissions: true,
        credentials: true,
        refreshTokens: true,
      },
    });
  }

  /**
   * Busca un usuario activo por su ID.
   * @param id ID del usuario a buscar.
   * @returns Usuario activo con el ID indicado o null si no existe.
   */
  async findActiveUserById(id: number): Promise<Users | null> {
    return await this.prisma.users.findFirst({
      where: {
        id,
        status: { in: [UserStatus.ACTIVE, UserStatus.PENDING_VERIFICATION] },
      },
    });
  }

  /**
   * Actualiza la contraseña de un usuario.
   * @param userId ID del usuario.
   * @param newPasswordHash El hash de la nueva contraseña.
   */
  async changePassword(userId: number, newPasswordHash: string): Promise<void> {
    // Desactiva la credencial activa actual
    await this.prisma.userCredentials.updateMany({
      where: { userId: userId, isActive: true },
      data: { isActive: false, expiredAt: new Date() },
    });

    // Crea una nueva credencial activa
    await this.prisma.userCredentials.create({
      data: {
        userId,
        passwordHash: newPasswordHash,
        isActive: true,
      },
    });
  }

  /**
   * Actualiza las credenciales de un usuario.
   * @param userCredentialData Datos de la credencial a actualizar.
   */
  async updateCredential(userCredentialData: UserCredentials): Promise<void> {
    await this.prisma.userCredentials.update({
      where: { id: userCredentialData.id, isActive: true },
      data: {
        attempts: userCredentialData.attempts,
        createdAt: userCredentialData.createdAt,
        expiredAt: userCredentialData.expiredAt,
        isActive: userCredentialData.isActive,
        passwordHash: userCredentialData.passwordHash,
        userId: userCredentialData.userId,
      },
    });
  }
}
