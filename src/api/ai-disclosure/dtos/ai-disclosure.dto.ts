import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AiContentDisclosure } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class MarkAiContentRequestDTO {
  @ApiProperty({
    example: 'order-summary',
    description: 'Tipo de entidad (libre).',
  })
  @IsString()
  @Matches(/^[\w.-]{1,100}$/)
  entityType!: string;

  @ApiProperty({ example: '42' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  entityId!: string;

  @ApiProperty({
    example: 'gpt-4o',
    description: 'Modelo que generó el contenido.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AiDisclosureResponseDTO {
  @ApiProperty() id!: string;
  @ApiProperty() entityType!: string;
  @ApiProperty() entityId!: string;
  @ApiProperty() model!: string;
  @ApiProperty() generatedAt!: Date;
  @ApiProperty({
    nullable: true,
    description: 'Id del usuario que revisó el contenido.',
  })
  reviewedBy!: number | null;
  @ApiProperty({ nullable: true }) reviewedAt!: Date | null;
  @ApiProperty({ nullable: true }) notes!: string | null;
  @ApiProperty({ description: 'Hubo revisión humana.' }) reviewed!: boolean;

  static fromEntity(row: AiContentDisclosure): AiDisclosureResponseDTO {
    return {
      id: row.referenceId,
      entityType: row.entityType,
      entityId: row.entityId,
      model: row.model,
      generatedAt: row.generatedAt,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt,
      notes: row.notes,
      reviewed: row.reviewedAt !== null,
    };
  }
}
