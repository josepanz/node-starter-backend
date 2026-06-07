import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';

@Injectable()
export class UserRolesDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  async getUserRoleIds(userId: number): Promise<number[]> {
    const userRoles = await this.prisma.extended.userRoles.findMany({
      where: { userId, isActive: true, role: { isActive: true } },
      select: { roleId: true },
    });
    return userRoles.map((ur) => ur.roleId);
  }

  async replaceUserRoles(
    userId: number,
    roleIds: number[],
    changedBy: string,
    tx?: any,
  ): Promise<void> {
    if (roleIds.length === 0) {
      throw new BadRequestException(
        'Debe asignarse al menos un rol al usuario.',
      );
    }

    if (roleIds.length > 1) {
      throw new BadRequestException(
        'Solo se permite asignar un rol por usuario.',
      );
    }

    const client = tx ?? this.prisma.extended;

    // Desactiva todos los roles actuales
    await client.userRoles.updateMany({
      where: { userId, isActive: true },
      data: {
        isActive: false,
        lastChangedBy: changedBy,
        lastChangedAt: new Date(),
      },
    });

    // Upsert: reactivar si ya existía el par userId+roleId, crear si no
    await client.userRoles.upsert({
      where: {
        userId_roleId: { userId, roleId: roleIds[0] },
      },
      update: {
        isActive: true,
        lastChangedBy: changedBy,
        lastChangedAt: new Date(),
      },
      create: {
        userId,
        roleId: roleIds[0],
        createdBy: changedBy,
        isActive: true,
      },
    });
  }

  async getAllAvailableRoles(): Promise<
    {
      id: number;
      name: string;
      displayName: string | null;
      description: string | null;
    }[]
  > {
    return this.prisma.extended.roles.findMany({
      where: { isActive: true },
      select: { id: true, name: true, displayName: true, description: true },
      orderBy: { name: 'asc' },
    });
  }
}
