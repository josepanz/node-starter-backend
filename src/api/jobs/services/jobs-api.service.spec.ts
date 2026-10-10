import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JobsApiService } from './jobs-api.service';

const mockEnqueue = jest.fn();
const mockFind = jest.fn();
const mockRequeue = jest.fn();
const mockResolve = jest.fn();
const mockValidate = jest.fn();

const entity = {
  referenceId: 'ref',
  type: 'report.export',
  status: 'PENDING',
  attempts: 0,
  maxAttempts: 3,
  nextRunAt: new Date(),
  lastError: null,
  result: null,
  finishedAt: null,
  createdAt: new Date(),
};

describe('JobsApiService', () => {
  let service: JobsApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new JobsApiService(
      {
        enqueue: mockEnqueue,
        findByReference: mockFind,
        requeue: mockRequeue,
      } as never,
      { resolve: mockResolve, getTypes: () => ['report.export'] } as never,
    );
    mockResolve.mockReturnValue({ validatePayload: mockValidate });
  });

  it('enqueue valida el payload con el handler y encola con el usuario', async () => {
    mockEnqueue.mockResolvedValue(entity);

    const result = await service.enqueue(
      { type: 'report.export', payload: { rows: 3 } },
      9,
    );

    expect(mockValidate).toHaveBeenCalledWith({ rows: 3 });
    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 9, payload: { rows: 3 } }),
    );
    expect(result.referenceId).toBe('ref');
  });

  it('enqueue con type desconocido propaga BadRequest', async () => {
    mockResolve.mockImplementation(() => {
      throw new BadRequestException();
    });

    await expect(service.enqueue({ type: 'x' }, 1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('findOne: 404 si no existe', async () => {
    mockFind.mockResolvedValue(null);

    await expect(service.findOne('ref')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('requeue: 409 si el job existe pero no estaba FAILED', async () => {
    mockRequeue.mockResolvedValue(false);
    mockFind.mockResolvedValue(entity);

    await expect(service.requeue('ref')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('requeue: devuelve el job actualizado', async () => {
    mockRequeue.mockResolvedValue(true);
    mockFind.mockResolvedValue(entity);

    await expect(service.requeue('ref')).resolves.toMatchObject({
      referenceId: 'ref',
    });
  });
});
