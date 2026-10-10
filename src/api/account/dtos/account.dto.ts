import { ApiProperty } from '@nestjs/swagger';

export class DeletionStatusResponseDTO {
  @ApiProperty({ nullable: true, description: 'Cuándo se solicitó la baja.' })
  requestedAt!: Date | null;

  @ApiProperty({
    nullable: true,
    description: 'Fin del período de gracia: desde ahí la cuenta se anonimiza.',
  })
  scheduledAt!: Date | null;

  @ApiProperty({
    nullable: true,
    description: 'Cuándo se anonimizó (si ya ocurrió).',
  })
  anonymizedAt!: Date | null;
}
