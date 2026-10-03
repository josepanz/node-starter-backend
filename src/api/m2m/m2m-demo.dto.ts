import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class M2mEchoRequestDTO {
  @ApiProperty({ example: 'hola' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message!: string;
}
