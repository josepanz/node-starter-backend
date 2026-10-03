import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiClientStatus } from '@prisma/client';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

export class ApiClientResponseDTO {
  @ApiProperty({ example: '3f1c9a52-0f3e-4d57-9c1e-6a0b8f2f7a10' })
  referenceId!: string;

  @ApiProperty({ example: 'cli_1a2b3c4d5e6f708192' })
  clientId!: string;

  @ApiPropertyOptional({ nullable: true })
  clientName!: string | null;

  @ApiProperty({ enum: ApiClientStatus })
  status!: ApiClientStatus;

  @ApiProperty({ type: [String], example: ['demo:read'] })
  scopes!: string[];

  @ApiPropertyOptional({ nullable: true, example: 120 })
  rateLimitPerMinute!: number | null;

  @ApiProperty({ type: [String] })
  allowedIps!: string[];

  @ApiProperty()
  hmacEnabled!: boolean;

  @ApiPropertyOptional({ nullable: true })
  lastUsedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  secretRotatedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  lastChangedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  createdBy!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastChangedBy!: string | null;

  @ApiPropertyOptional({ nullable: true })
  changedReason!: string | null;
}

/** Respuesta con secretos en claro: se muestran UNA sola vez (alta, rotación, activar HMAC). */
export class ApiClientWithSecretsResponseDTO {
  @ApiProperty({ type: ApiClientResponseDTO })
  client!: ApiClientResponseDTO;

  @ApiPropertyOptional({
    description: 'Client secret en claro. No se vuelve a mostrar.',
  })
  clientSecret?: string;

  @ApiPropertyOptional({
    description: 'Signing secret HMAC en claro. No se vuelve a mostrar.',
  })
  signingSecret?: string;
}

export class ApiClientsListResponseDTO {
  @ApiProperty({ type: [ApiClientResponseDTO] })
  data!: ApiClientResponseDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}
