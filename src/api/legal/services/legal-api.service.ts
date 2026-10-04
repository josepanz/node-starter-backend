import { BadRequestException, Injectable } from '@nestjs/common';
import { LegalDocumentType } from '@prisma/client';
import { t } from '@common/i18n/i18n.helper';
import type { ICallerContext } from '@common/interfaces/caller-context.interface';
import { DataRetentionDBService } from '@modules/legal-db/services/data-retention-db.service';
import { LegalDocumentsDBService } from '@modules/legal-db/services/legal-documents-db.service';
import { UserConsentsDBService } from '@modules/legal-db/services/user-consents-db.service';
import {
  LegalDocumentResponseDTO,
  PublishLegalVersionRequestDTO,
  RetentionPolicyResponseDTO,
  UpsertRetentionPolicyRequestDTO,
  UserConsentResponseDTO,
} from '../dtos/legal.dto';

/** Capa API: orquesta DTO <-> dominio de cumplimiento (documentos, consentimientos, retención). */
@Injectable()
export class LegalApiService {
  constructor(
    private readonly documents: LegalDocumentsDBService,
    private readonly consents: UserConsentsDBService,
    private readonly retention: DataRetentionDBService,
  ) {}

  async listActive(): Promise<LegalDocumentResponseDTO[]> {
    return (await this.documents.listActive()).map((d) =>
      LegalDocumentResponseDTO.fromEntity(d),
    );
  }

  async listVersions(
    type?: LegalDocumentType,
  ): Promise<LegalDocumentResponseDTO[]> {
    return (await this.documents.listVersions(type)).map((d) =>
      LegalDocumentResponseDTO.fromEntity(d),
    );
  }

  async publish(
    dto: PublishLegalVersionRequestDTO,
    actor: string,
  ): Promise<LegalDocumentResponseDTO> {
    if (!dto.content && !dto.contentUrl) {
      throw new BadRequestException(t('legal.CONTENT_REQUIRED'));
    }
    return LegalDocumentResponseDTO.fromEntity(
      await this.documents.publish({ ...dto, actor }),
    );
  }

  async accept(
    userId: number,
    documentVersionId: string,
    caller: ICallerContext,
  ): Promise<UserConsentResponseDTO> {
    const version =
      await this.documents.findByReferenceOrFail(documentVersionId);
    return UserConsentResponseDTO.fromEntity(
      await this.consents.accept({
        userId,
        version,
        ipAddress: caller.ip,
        userAgent: caller.userAgent,
      }),
    );
  }

  async revoke(userId: number, type: LegalDocumentType): Promise<void> {
    await this.consents.revoke(userId, type);
  }

  async listMine(userId: number): Promise<UserConsentResponseDTO[]> {
    return (await this.consents.listByUser(userId)).map((c) =>
      UserConsentResponseDTO.fromEntity(c),
    );
  }

  async listPolicies(): Promise<RetentionPolicyResponseDTO[]> {
    return (await this.retention.list()).map((p) =>
      RetentionPolicyResponseDTO.fromEntity(p),
    );
  }

  async upsertPolicy(
    dto: UpsertRetentionPolicyRequestDTO,
    actor: string,
  ): Promise<RetentionPolicyResponseDTO> {
    return RetentionPolicyResponseDTO.fromEntity(
      await this.retention.upsert({ ...dto, actor }),
    );
  }
}
