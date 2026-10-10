import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class EnqueueJobRequestDTO {
  @ApiProperty({
    example: 'report.export',
    description: 'Type registrado (ver GET /jobs/types).',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type!: string;

  @ApiPropertyOptional({
    example: { title: 'Reporte demo', rows: 20 },
    description: 'Payload específico del type; lo valida su handler.',
  })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 3,
    description: 'Default: JOBS_MAX_ATTEMPTS.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxAttempts?: number;
}
