import { BadRequestException } from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { CreateUserRequestDto } from '../dtos/request/create-user.request.dto';
import { UserStatus } from '@prisma/client';
import { Users } from '@prisma/client';
import { AuditUserEnum } from '@common/enum/audit-user.enum';

export async function createUser(
  dto: CreateUserRequestDto,
  datasource: PrismaDatasource,
  performedBy: string = AuditUserEnum.SYSTEM,
): Promise<Users> {
  // Validar si ya existe el usuario por email y documentNumber
  const existingUser = await datasource.users.findFirst({
    where: {
      email: dto.email,
      documentNumber: dto.documentNumber,
    },
  });

  if (existingUser) {
    throw new BadRequestException(
      `El usuario con el documento ${dto.documentNumber} y el correo electrónico ${dto.email} ya existe.`,
    );
  }

  // Crear usuario
  const user = await datasource.users.create({
    data: {
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      documentNumber: dto.documentNumber,
      status: dto.status ?? UserStatus.ACTIVE,
      lastLogin: dto.lastLogin ?? new Date(),
      createdBy: performedBy,
    },
  });

  return user;
}
