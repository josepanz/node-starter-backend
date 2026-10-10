import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';
import type { IAuditLogRow } from '@modules/audit-log-db/interfaces/audit-log.interface';

export class AuditLogFiltersDTO {
  @ApiPropertyOptional({ example: 'users' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tableName?: string;

  @ApiPropertyOptional({ enum: ['INSERT', 'UPDATE', 'DELETE'] })
  @IsOptional()
  @IsIn(['INSERT', 'UPDATE', 'DELETE'])
  operationType?: string;

  @ApiPropertyOptional({
    description: 'Quién hizo el cambio (email o `system`).',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  changedBy?: string;

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

  @ApiPropertyOptional({
    description: 'traceId de la request que originó el cambio.',
  })
  @IsOptional()
  @Matches(/^[\w-]{8,64}$/)
  traceId?: string;
}

export class ListAuditLogsRequestDTO extends AuditLogFiltersDTO {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 20;
}

export class RecentAccessRequestDTO {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit: number = 5;
}

export class AuditLogResponseDTO implements IAuditLogRow {
  @ApiProperty({ description: 'bigint serializado como string.' }) id!: string;
  @ApiProperty() tableName!: string;
  @ApiProperty() recordId!: string;
  @ApiProperty({ enum: ['INSERT', 'UPDATE', 'DELETE'] }) operationType!: string;
  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  oldData!: unknown;
  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  newData!: unknown;
  @ApiProperty() changedAt!: Date;
  @ApiProperty() changedBy!: string;
  @ApiPropertyOptional({ nullable: true }) reason!: string | null;
  @ApiPropertyOptional({ nullable: true }) ipAddress!: string | null;
  @ApiPropertyOptional({ nullable: true }) userAgent!: string | null;
  @ApiPropertyOptional({ nullable: true }) extraData!: string | null;
  @ApiPropertyOptional({ nullable: true }) audVersion!: number | null;
}

export class AuditLogsListResponseDTO {
  @ApiProperty({ type: [AuditLogResponseDTO] }) data!: AuditLogResponseDTO[];
  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}

export class RecentAccessResponseDTO {
  @ApiPropertyOptional({ nullable: true }) ipAddress!: string | null;
  @ApiProperty() changedAt!: Date;
}
