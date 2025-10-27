import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'El ID único del rol.',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'El nombre del rol (ej: admin).',
    example: 'admin',
  })
  name: string;

  @ApiProperty({
    description: 'La fecha de creación del rol.',
    example: '2023-10-27T10:00:00.000Z',
  })
  createdAt: Date;
}
