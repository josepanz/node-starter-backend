import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LegalDocumentType,
  LegalDocumentVersion,
  Prisma,
} from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { t } from '@common/i18n/i18n.helper';

export interface IPublishVersion {
  type: LegalDocumentType;
  version: string;
  title?: string;
  content?: string;
  contentUrl?: string;
  activate: boolean;
  actor: string;
}

/**
 * Repositorio de documentos legales versionados. Invariante: a lo sumo UNA versión activa por tipo
 * (índice único parcial en la migración); publicar = desactivar la anterior + crear la nueva en
 * una sola transacción, así nunca hay un instante sin versión vigente ni dos a la vez.
 */
@Injectable()
export class LegalDocumentsDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  listActive(): Promise<LegalDocumentVersion[]> {
    return this.prisma.legalDocumentVersion.findMany({
      where: { isActive: true },
      orderBy: { type: 'asc' },
    });
  }

  listVersions(type?: LegalDocumentType): Promise<LegalDocumentVersion[]> {
    return this.prisma.legalDocumentVersion.findMany({
      where: { type },
      orderBy: [{ type: 'asc' }, { publishedAt: 'desc' }],
    });
  }

  async findByReferenceOrFail(
    referenceId: string,
  ): Promise<LegalDocumentVersion> {
    const found = await this.prisma.legalDocumentVersion.findUnique({
      where: { referenceId },
    });
    if (!found) throw new NotFoundException(t('legal.VERSION_NOT_FOUND'));
    return found;
  }

  async publish(input: IPublishVersion): Promise<LegalDocumentVersion> {
    try {
      return await this.prisma.extended.$transaction(async (tx) => {
        if (input.activate) {
          await tx.legalDocumentVersion.updateMany({
            where: { type: input.type, isActive: true },
            data: { isActive: false, lastChangedBy: input.actor },
          });
        }
        return await tx.legalDocumentVersion.create({
          data: {
            type: input.type,
            version: input.version,
            title: input.title,
            content: input.content,
            contentUrl: input.contentUrl,
            isActive: input.activate,
            createdBy: input.actor,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(t('legal.VERSION_DUPLICATED'));
      }
      throw error;
    }
  }
}
