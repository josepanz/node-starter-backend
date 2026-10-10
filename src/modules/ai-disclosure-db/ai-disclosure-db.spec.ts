import { NotFoundException } from '@nestjs/common';
import { AiDisclosureDBService } from './services/ai-disclosure-db.service';

describe('AiDisclosureDBService', () => {
  const prisma = {
    aiContentDisclosure: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new AiDisclosureDBService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('mark: upsert por (entityType, entityId) y reinicia la revisión al re-marcar', async () => {
    prisma.aiContentDisclosure.upsert.mockResolvedValue({ id: 1 });

    await service.mark({ entityType: 'order', entityId: '1', model: 'm-1' });

    const arg = prisma.aiContentDisclosure.upsert.mock.calls[0][0];
    expect(arg.where).toEqual({
      entityType_entityId: { entityType: 'order', entityId: '1' },
    });
    expect(arg.update).toMatchObject({ reviewedBy: null, reviewedAt: null });
  });

  it('find: 404 si la entidad no está marcada', async () => {
    prisma.aiContentDisclosure.findUnique.mockResolvedValue(null);

    await expect(service.find('order', '9')).rejects.toThrow(NotFoundException);
  });

  it('markReviewed: guarda quién y cuándo revisó', async () => {
    prisma.aiContentDisclosure.findUnique.mockResolvedValue({ id: 1 });
    prisma.aiContentDisclosure.update.mockResolvedValue({ id: 1 });

    await service.markReviewed('order', '1', 7);

    const { data } = prisma.aiContentDisclosure.update.mock.calls[0][0];
    expect(data.reviewedBy).toBe(7);
    expect(data.reviewedAt).toBeInstanceOf(Date);
  });
});
