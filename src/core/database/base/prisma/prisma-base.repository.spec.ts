import { ConflictException } from '@nestjs/common';
import { PrismaBaseRepository } from './prisma-base.repository';

const mockUpdateMany = jest.fn();

const buildRepository = () =>
  new PrismaBaseRepository<{ id: number }>(
    {} as never,
    {
      updateMany: mockUpdateMany,
    } as never,
  );

describe('PrismaBaseRepository.updateWhereStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('actualiza con WHERE id AND status IN esperados', async () => {
    mockUpdateMany.mockResolvedValue({ count: 1 });

    await buildRepository().updateWhereStatus(5, ['PENDING', 'CONFIRMED'], {
      status: 'CANCELLED',
    });

    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { id: 5, status: { in: ['PENDING', 'CONFIRMED'] } },
      data: { status: 'CANCELLED' },
    });
  });

  it('lanza ConflictException si ninguna fila matchea (estado cambió)', async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      buildRepository().updateWhereStatus(5, ['PENDING'], { status: 'X' }),
    ).rejects.toThrow(ConflictException);
  });

  it('permite campos y mensaje personalizados', async () => {
    mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(
      buildRepository().updateWhereStatus(
        'abc',
        ['A'],
        {},
        {
          idField: 'referenceId',
          statusField: 'state',
          conflictMessage: 'custom',
        },
      ),
    ).rejects.toThrow('custom');
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { referenceId: 'abc', state: { in: ['A'] } },
      data: {},
    });
  });
});
