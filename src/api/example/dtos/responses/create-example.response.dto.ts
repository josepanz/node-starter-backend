import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateExampleRequestDto } from '../requests/create-example.request.dto';
import { IsNumber } from 'class-validator';

export class CreateExampleResponseDto extends PartialType(
  CreateExampleRequestDto,
) {
  @ApiProperty({ example: 1, description: 'El ID único del usuario.' })
  @IsNumber()
  id: number;
}
