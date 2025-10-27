import { CreatePermissionRequestDto } from '@api/permissions/dtos/request/create-permission.request.dto';
import { UpdatePermissionRequestDto } from '@api/permissions/dtos/request/update-permission.request.dto';
import { PermissionResponseDto } from '@api/permissions/dtos/response/permission.response.dto';
import { AuditUserEnum } from '@common/enum/audit-user.enum';
import { PrismaDatasource } from '@core/database/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaDatasource) {}

  /**
   * Crea un nuevo permiso.
   * @param dto El DTO con el nombre del permiso.
   * @param createdBy El usuario del request, que envía la petición de creación de permiso.
   * @returns El permiso creado.
   */
  async create(
    dto: CreatePermissionRequestDto,
    createdBy?: string,
  ): Promise<PermissionResponseDto | null> {
    return await this.prisma.permission.create({
      data: {
        name: dto.name,
        code: dto.code,
        createdBy: createdBy ?? AuditUserEnum.SYSTEM,
        createdAt: new Date(),
      },
    });
  }

  /**
   * Actualiza un permisso.
   * @param dto El DTO con datos del permiso a actualizar.
   * @param updatedBy El usuario que realiza la acción.
   * @returns El permiso actualizado.
   */
  async update(
    dto: UpdatePermissionRequestDto,
    updatedBy: string,
  ): Promise<PermissionResponseDto> {
    return await this.prisma.permission.update({
      where: { id: dto.id },
      data: {
        ...dto,
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        lastChangedAt: new Date(),
      },
    });
  }

  /**
   * Obtiene todos los permisos.
   * @returns Una lista de todos los permisos.
   */
  async findAll(): Promise<PermissionResponseDto[] | null> {
    return await this.prisma.permission.findMany();
  }

  /**
   * Obtiene un permiso por su ID.
   * @param id El ID del permiso.
   * @returns El permiso encontrado.
   * @throws NotFoundException si el permiso no existe.
   */
  async findOne(id: number): Promise<PermissionResponseDto | null> {
    return await this.prisma.permission.findUnique({
      where: { id },
    });
  }

  /**
   * Elimina lógica de un permiso por su ID.
   * @param id El ID del permiso.
   * @param updatedBy El usuario que realiza la acción.
   * @throws NotFoundException si el permiso no existe.
   */
  async remove(id: number, updatedBy?: string): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado.`);
    }
    await this.prisma.permission.update({
      where: { id },
      data: {
        isActive: false,
        lastChangedAt: new Date(),
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        changedReason: `Eliminado por ${updatedBy ?? AuditUserEnum.SYSTEM}`,
      },
    });
  }
}
