import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { CreateUserRequestDto } from './create-user.request.dto';

export class UpdateUserRequestDto extends PartialType(CreateUserRequestDto) {
  @ApiProperty({
    example: '2024-06-16T10:20:30Z',
    required: false,
    description: 'La fecha y hora de la última modificación.',
  })
  @IsOptional()
  @IsISO8601()
  lastChangedAt?: Date;

  @ApiProperty({
    example: 'admin@example.com',
    required: false,
    description: 'El usuario que realizó la última modificación.',
  })
  @IsOptional()
  @IsString()
  lastChangedBy?: string;

  @ApiProperty({
    example: 'Cantidad de login fallidos superados',
    required: false,
    description: 'Razón por la cual se realizó la última modificación.',
  })
  @IsOptional()
  @IsString()
  changedReason?: string;
}
