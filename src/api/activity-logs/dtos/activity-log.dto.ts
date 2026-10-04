import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { IActivityLogRecord } from '@modules/activity-log/interfaces/activity-log-store.interface';

export class ListActivityLogsRequestDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actorId?: number;

  @ApiPropertyOptional({ example: 'order.status-changed' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  action?: string;

  @ApiPropertyOptional({ example: 'order' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  entityId?: string;

  @ApiPropertyOptional({ description: 'Desde (ISO 8601).' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ description: 'Hasta (ISO 8601).' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;
}

export class ActivityLogResponseDTO implements IActivityLogRecord {
  @ApiProperty() id!: string;
  @ApiPropertyOptional() actorId?: number;
  @ApiProperty() action!: string;
  @ApiPropertyOptional() entityType?: string;
  @ApiPropertyOptional() entityId?: string;
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  metadata?: Record<string, unknown>;
  @ApiPropertyOptional() traceId?: string;
  @ApiProperty() createdAt!: Date;
}

export class ActivityLogsListResponseDTO {
  @ApiProperty({
    enum: ['mongo', 'noop'],
    description: 'Store activo: `noop` = sin MONGO_URI (no se persiste nada).',
  })
  storage!: 'mongo' | 'noop';

  @ApiProperty({ type: [ActivityLogResponseDTO] })
  items!: ActivityLogResponseDTO[];
}
