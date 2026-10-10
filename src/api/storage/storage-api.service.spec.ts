import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { StorageApiService } from './storage-api.service';

const file = (name: string) =>
  ({ originalname: name, buffer: Buffer.from('x') }) as Express.Multer.File;

describe('StorageApiService', () => {
  const storage = { uploadFilesQueue: jest.fn() };
  const users = { updateDocument: jest.fn() };
  let service: StorageApiService;

  const params = {
    files: { front: [file('f.png')], back: [file('b1.png'), file('b2.png')] },
    userId: '12',
    referenceId: 'ref-1',
    documentType: 'CIP',
    documentNumber: '123',
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StorageApiService(storage as never, users as never);
  });

  it('sube cada archivo al path del tenant y actualiza el documento del usuario', async () => {
    storage.uploadFilesQueue.mockResolvedValue([]);
    await service.uploadFile(params);
    const inputs = storage.uploadFilesQueue.mock.calls[0][0] as {
      id: string;
      path: string;
    }[];
    expect(inputs).toHaveLength(3);
    expect(inputs.map((i) => i.id)).toEqual(['front', 'back', 'back']);
    expect(inputs.every((i) => i.path === 'onboarding/tenants/ref-1/1')).toBe(
      true,
    );
    expect(users.updateDocument).toHaveBeenCalledWith(12, {
      documentNumber: '123',
      documentType: 'CIP',
    });
  });

  it('no actualiza el usuario si falla la subida', async () => {
    storage.uploadFilesQueue.mockRejectedValue(new Error('s3'));
    await expect(service.uploadFile(params)).rejects.toThrow(
      InternalServerErrorException,
    );
    expect(users.updateDocument).not.toHaveBeenCalled();
  });

  it('preserva las HttpException del almacenamiento', async () => {
    const err = new BadRequestException('inválido');
    storage.uploadFilesQueue.mockRejectedValue(err);
    await expect(service.uploadFile(params)).rejects.toBe(err);
  });

  it('acepta resultados sin id sin fallar', async () => {
    storage.uploadFilesQueue.mockResolvedValue([
      { key: 'k1', id: 'front' },
      { key: 'k2' },
    ]);
    await expect(service.uploadFile(params)).resolves.toBeUndefined();
  });
});
