import { Injectable } from '@nestjs/common';
import { DataRetentionPolicy, RetentionAction } from '@prisma/client';
import { PrismaDatasource } from '@core/database/services/prisma.service';

export interface IUpsertRetentionPolicy {
  entity: string;
  retentionDays: number;
  action: RetentionAction;
  isActive: boolean;
  actor: string;
}

/** Políticas de retención por entidad (una fila por `entity`). Las aplica el job de anonimización. */
@Injectable()
export class DataRetentionDBService {
  constructor(private readonly prisma: PrismaDatasource) {}

  list(): Promise<DataRetentionPolicy[]> {
    return this.prisma.dataRetentionPolicy.findMany({
      orderBy: { entity: 'asc' },
    });
  }

  listActive(): Promise<DataRetentionPolicy[]> {
    return this.prisma.dataRetentionPolicy.findMany({
      where: { isActive: true },
    });
  }

  upsert(input: IUpsertRetentionPolicy): Promise<DataRetentionPolicy> {
    const data = {
      retentionDays: input.retentionDays,
      action: input.action,
      isActive: input.isActive,
    };
    return this.prisma.extended.dataRetentionPolicy.upsert({
      where: { entity: input.entity },
      create: { ...data, entity: input.entity, createdBy: input.actor },
      update: { ...data, lastChangedBy: input.actor },
    });
  }
}
