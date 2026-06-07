import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class OnboardingUserResponseDTO {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description:
      'Identificador público del usuario, generado como UUID v4. Puede ser usado en el frontend o APIs públicas sin exponer el ID interno.',
  })
  referenceId: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico registrado del usuario.',
  })
  email: string;

  @ApiProperty({
    example: UserStatus.PENDING_VERIFICATION,
    description:
      'Estado del usuario. Indica si completó el registro y/o la verificación de email.',
    enum: UserStatus,
  })
  status: UserStatus;
}
