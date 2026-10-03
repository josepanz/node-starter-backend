import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiClientStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  API_CLIENT_MAX_ALLOWED_IPS,
  API_CLIENT_MAX_SCOPES,
  API_CLIENT_SCOPE_PATTERN,
} from '@modules/api-clients-db/constants/api-client-scopes.constants';

const IP_OR_CIDR = /^[0-9a-fA-F:.]+(\/\d{1,3})?$/;
const MAX_RATE_LIMIT = 100_000;

export class CreateApiClientRequestDTO {
  @ApiPropertyOptional({ example: 'Integración de conciliación' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  clientName?: string;

  @ApiProperty({
    example: ['demo:read'],
    description: 'Scopes `dominio:acción` (o `*`).',
  })
  @IsArray()
  @ArrayMaxSize(API_CLIENT_MAX_SCOPES)
  @Matches(API_CLIENT_SCOPE_PATTERN, { each: true })
  scopes!: string[];

  @ApiPropertyOptional({
    example: 120,
    description: 'Requests por minuto; vacío = default global.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_RATE_LIMIT)
  rateLimitPerMinute?: number;

  @ApiPropertyOptional({
    example: ['203.0.113.10', '198.51.100.0/24'],
    description: 'Allowlist de IPs/CIDR IPv4; vacío = sin restricción.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(API_CLIENT_MAX_ALLOWED_IPS)
  @Matches(IP_OR_CIDR, { each: true })
  allowedIps?: string[];

  @ApiPropertyOptional({
    example: false,
    description:
      'Exige firma HMAC en los requests (requiere ENCRYPTION_KEYS). El signing secret se muestra una sola vez.',
  })
  @IsOptional()
  @IsBoolean()
  hmacEnabled?: boolean;
}

export class ListApiClientsRequestDTO {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize: number = 10;

  @ApiPropertyOptional({ enum: ApiClientStatus })
  @IsOptional()
  @IsEnum(ApiClientStatus)
  status?: ApiClientStatus;

  @ApiPropertyOptional({ description: 'Busca en clientId y nombre.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}

export class UpdateApiClientStatusRequestDTO {
  @ApiProperty({ enum: ApiClientStatus, example: ApiClientStatus.INACTIVE })
  @IsEnum(ApiClientStatus)
  status!: ApiClientStatus;

  @ApiProperty({ example: 'Integración dada de baja' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  changedReason!: string;
}

export class UpdateApiClientSettingsRequestDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  clientName?: string;

  @ApiPropertyOptional({ example: ['demo:read', 'demo:write'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(API_CLIENT_MAX_SCOPES)
  @Matches(API_CLIENT_SCOPE_PATTERN, { each: true })
  scopes?: string[];

  @ApiPropertyOptional({
    example: 120,
    nullable: true,
    description: '`null` borra el límite propio y vuelve al default global.',
  })
  // IsOptional deja pasar null (borrar) y undefined (no tocar).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_RATE_LIMIT)
  rateLimitPerMinute?: number | null;

  @ApiPropertyOptional({ example: ['203.0.113.10'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(API_CLIENT_MAX_ALLOWED_IPS)
  @Matches(IP_OR_CIDR, { each: true })
  allowedIps?: string[];

  @ApiPropertyOptional({
    description:
      'Activar HMAC devuelve el signing secret una sola vez; desactivarlo lo elimina.',
  })
  @IsOptional()
  @IsBoolean()
  hmacEnabled?: boolean;

  @ApiPropertyOptional({ example: 'Ajuste de capacidad' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  changedReason?: string;
}
