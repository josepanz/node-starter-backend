import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BlockUserRequestDTO {
  @ApiProperty({
    example: 'Se detectaron intentos de acceso sospechosos',
    description: 'Motivo del bloqueo del usuario',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo de bloqueo es obligatorio' })
  reason!: string;
}
