import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnblockUserRequestDTO {
  @ApiProperty({
    example: 'Se validó identidad y se restableció acceso',
    description: 'Motivo del desbloqueo del usuario',
  })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo de desbloqueo es obligatorio' })
  reason!: string;
}
