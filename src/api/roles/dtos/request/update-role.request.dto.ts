import { IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleRequestDto } from '@api/roles/dtos/request/create-role.request.dto';

export class UpdateRoleRequestDto extends PartialType(CreateRoleRequestDto) {
  @IsNumber()
  @ApiProperty({
    description: 'El ID único del rol.',
    example: 1,
  })
  id: number;
}
