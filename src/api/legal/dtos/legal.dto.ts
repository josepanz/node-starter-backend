import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DataRetentionPolicy,
  LegalDocumentType,
  LegalDocumentVersion,
  RetentionAction,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { UserConsentWithVersion } from '@modules/legal-db/services/user-consents-db.service';

export class PublishLegalVersionRequestDTO {
  @ApiProperty({ enum: LegalDocumentType })
  @IsEnum(LegalDocumentType)
  type!: LegalDocumentType;

  @ApiProperty({ example: '2' })
  @IsString()
  @Matches(/^[\w.-]{1,32}$/)
  version!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    description: 'Texto del documento (o usar contentUrl).',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @MaxLength(1024)
  contentUrl?: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Activa la versión y desactiva la anterior del mismo tipo.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'false' ? false : value,
  )
  @IsBoolean()
  activate: boolean = true;
}

export class AcceptConsentRequestDTO {
  @ApiProperty({ description: 'referenceId de la versión activa a aceptar.' })
  @IsUUID()
  documentVersionId!: string;
}

export class UpsertRetentionPolicyRequestDTO {
  @ApiProperty({ example: 'notifications' })
  @IsString()
  @Matches(/^[a-z][a-z0-9_.-]{0,99}$/)
  entity!: string;

  @ApiProperty({ example: 365 })
  @IsInt()
  @Min(0)
  @Max(36500)
  retentionDays!: number;

  @ApiProperty({ enum: RetentionAction })
  @IsEnum(RetentionAction)
  action!: RetentionAction;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;
}

export class LegalDocumentResponseDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: LegalDocumentType }) type!: LegalDocumentType;
  @ApiProperty() version!: string;
  @ApiPropertyOptional({ nullable: true }) title!: string | null;
  @ApiPropertyOptional({ nullable: true }) content!: string | null;
  @ApiPropertyOptional({ nullable: true }) contentUrl!: string | null;
  @ApiProperty() publishedAt!: Date;
  @ApiProperty() isActive!: boolean;

  static fromEntity(doc: LegalDocumentVersion): LegalDocumentResponseDTO {
    return {
      id: doc.referenceId,
      type: doc.type,
      version: doc.version,
      title: doc.title,
      content: doc.content,
      contentUrl: doc.contentUrl,
      publishedAt: doc.publishedAt,
      isActive: doc.isActive,
    };
  }
}

export class UserConsentResponseDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: LegalDocumentType }) type!: LegalDocumentType;
  @ApiProperty() version!: string;
  @ApiProperty() documentVersionId!: string;
  @ApiProperty() acceptedAt!: Date;
  @ApiPropertyOptional({ nullable: true }) revokedAt!: Date | null;
  @ApiProperty({
    description: 'Vigente: no revocado y sobre la versión activa.',
  })
  isCurrent!: boolean;

  static fromEntity(consent: UserConsentWithVersion): UserConsentResponseDTO {
    return {
      id: consent.referenceId,
      type: consent.documentVersion.type,
      version: consent.documentVersion.version,
      documentVersionId: consent.documentVersion.referenceId,
      acceptedAt: consent.acceptedAt,
      revokedAt: consent.revokedAt,
      isCurrent: consent.revokedAt === null && consent.documentVersion.isActive,
    };
  }
}

export class RetentionPolicyResponseDTO {
  @ApiProperty() entity!: string;
  @ApiProperty() retentionDays!: number;
  @ApiProperty({ enum: RetentionAction }) action!: RetentionAction;
  @ApiProperty() isActive!: boolean;

  static fromEntity(policy: DataRetentionPolicy): RetentionPolicyResponseDTO {
    return {
      entity: policy.entity,
      retentionDays: policy.retentionDays,
      action: policy.action,
      isActive: policy.isActive,
    };
  }
}
