import { Injectable, NotFoundException } from '@nestjs/common';
import { AiContentDisclosure } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { t } from '@common/i18n/i18n.helper';

export interface IMarkAiContent {
  entityType: string;
  entityId: string;
  model: string;
  notes?: string;
}

/**
 * Transparencia de contenido generado por IA, genérica: cualquier entidad se identifica por
 * (entityType, entityId). Marcar es idempotente (upsert por esa clave: re-generar con otro modelo
 * actualiza el registro y reinicia la revisión humana).
 */
@Injectable()
export class AiDisclosureDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  mark(input: IMarkAiContent): Promise<AiContentDisclosure> {
    const data = { model: input.model, notes: input.notes };
    return this.prisma.aiContentDisclosure.upsert({
      where: {
        entityType_entityId: {
          entityType: input.entityType,
          entityId: input.entityId,
        },
      },
      create: {
        entityType: input.entityType,
        entityId: input.entityId,
        ...data,
      },
      update: {
        ...data,
        generatedAt: new Date(),
        reviewedBy: null,
        reviewedAt: null,
      },
    });
  }

  async find(
    entityType: string,
    entityId: string,
  ): Promise<AiContentDisclosure> {
    const found = await this.prisma.aiContentDisclosure.findUnique({
      where: { entityType_entityId: { entityType, entityId } },
    });
    if (!found) throw new NotFoundException(t('common.NOT_FOUND'));
    return found;
  }

  async markReviewed(
    entityType: string,
    entityId: string,
    reviewerId: number,
  ): Promise<AiContentDisclosure> {
    await this.find(entityType, entityId);
    return await this.prisma.aiContentDisclosure.update({
      where: { entityType_entityId: { entityType, entityId } },
      data: { reviewedBy: reviewerId, reviewedAt: new Date() },
    });
  }
}
