import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaDatasource } from '@core/database/prisma.service';
import { UpdateRoleRequestDto } from '@api/roles/dtos/request/update-role.request.dto';
import { RoleResponseDto } from '@api/roles/dtos/response/role.response.dto';
import { CreateRoleRequestDto } from '@api/roles/dtos/request/create-role.request.dto';
import { AuditUserEnum } from '@common/enum/audit-user.enum';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaDatasource) {}

  /**
   * Crea un nuevo rol.
   * @param dto El DTO con el nombre del rol.
   * @param createdBy El usuario que realiza la acción.
   * @returns El rol creado.
   */
  async create(
    dto: CreateRoleRequestDto,
    createdBy: string,
  ): Promise<RoleResponseDto> {
    return await this.prisma.roles.create({
      data: {
        ...dto,
        createdBy,
      },
    });
  }

  /**
   * Actualiza nuevo rol.
   * @param dto El DTO con el nombre del rol.
   * @param updatedBy El usuario que realiza la acción.
   * @returns El rol actualizado.
   */
  async update(
    dto: UpdateRoleRequestDto,
    updatedBy: string,
  ): Promise<RoleResponseDto> {
    return await this.prisma.roles.update({
      where: { id: dto.id },
      data: {
        ...dto,
        lastChangedBy: updatedBy ?? AuditUserEnum.SYSTEM,
        lastChangedAt: new Date(),
      },
    });
  }

  /**
   * Obtiene todos los roles.
   * @returns Una lista de todos los roles.
   */
  async findAll(): Promise<RoleResponseDto[]> {
    return await this.prisma.roles.findMany();
  }

  /**
   * Obtiene un rol por su ID.
   * @param id El ID del rol.
   * @returns El rol encontrado.
   * @throws NotFoundException si el rol no existe.
   */
  async findOne(id: number): Promise<RoleResponseDto> {
    const role = await this.prisma.roles.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    }
    return role;
  }

  /**
   * Eliminación lógica de un rol por su ID.
   * @param id El ID del rol.
   * @param updatedBy El usuario que realiza la acción.
   * @throws NotFoundException si el rol no existe.
   */
  async remove(id: number, updatedBy: string): Promise<void> {
    const role = await this.prisma.roles.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado.`);
    }
    await this.prisma.roles.update({
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
