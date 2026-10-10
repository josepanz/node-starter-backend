import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class VerifyContentRequestDTO {
  @ApiProperty({ example: '3f1c9a52-0f3e-4d57-9c1e-6a0b8f2f7a10' })
  @IsUUID()
  referenceId!: string;

  @ApiProperty({
    description:
      'Contenido a comparar. SMS: el texto. EMAIL: `<asunto>\\n<html>`.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200_000)
  content!: string;
}
