import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ApiClientStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ApiClientsDBService } from './api-clients-db.service';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFindUnique = jest.fn();
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockTransaction = jest.fn();
const mockEncrypt = jest.fn();
const mockDecrypt = jest.fn();
const signingSecrets = {
  available: true,
  encrypt: mockEncrypt,
  decrypt: mockDecrypt,
};

const prisma = {
  extended: {
    apiClientCredential: {
      create: mockCreate,
      update: mockUpdate,
      findUnique: mockFindUnique,
      findMany: mockFindMany,
      count: mockCount,
    },
    $transaction: mockTransaction,
  },
} as never;
const config = { apiClients: { bcryptRounds: 4 } } as never;

const buildRow = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  referenceId: 'ref-1',
  clientId: 'cli_abc',
  clientName: 'Demo',
  secretHash: 'hash',
  status: ApiClientStatus.ACTIVE,
  scopes: ['demo:read'],
  rateLimitPerMinute: null,
  allowedIps: [],
  hmacEnabled: false,
  signingSecretEnc: null,
  lastUsedAt: null,
  secretRotatedAt: null,
  createdAt: new Date('2026-01-01'),
  lastChangedAt: null,
  createdBy: 'admin',
  lastChangedBy: null,
  changedReason: null,
  ...overrides,
});

describe('ApiClientsDBService', () => {
  let service: ApiClientsDBService;

  beforeEach(() => {
    signingSecrets.available = true;
    mockEncrypt.mockImplementation((value: string) => `enc(${value})`);
    mockUpdate.mockResolvedValue(buildRow());
    service = new ApiClientsDBService(prisma, signingSecrets as never, config);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('guarda solo el hash bcrypt y devuelve el secret en claro una vez', async () => {
      mockCreate.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve(buildRow(data)),
      );

      const result = await service.create({
        clientName: 'Demo',
        scopes: ['demo:read'],
        createdBy: 'admin',
      });

      const stored = mockCreate.mock.calls[0][0].data as { secretHash: string };
      expect(result.clientSecret).toBeDefined();
      expect(stored.secretHash).not.toBe(result.clientSecret);
      expect(
        await bcrypt.compare(result.clientSecret as string, stored.secretHash),
      ).toBe(true);
      expect(result.signingSecret).toBeUndefined();
      expect(JSON.stringify(result.client)).not.toContain(stored.secretHash);
    });

    it('con HMAC genera y cifra el signing secret', async () => {
      mockCreate.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve(buildRow(data)),
      );

      const result = await service.create({ scopes: [], hmacEnabled: true });

      expect(result.signingSecret).toBeDefined();
      expect(mockCreate.mock.calls[0][0].data.signingSecretEnc).toBe(
        `enc(${result.signingSecret})`,
      );
    });

    it('rechaza HMAC si no hay keyring de cifrado', async () => {
      signingSecrets.available = false;

      await expect(
        service.create({ scopes: [], hmacEnabled: true }),
      ).rejects.toThrow(ConflictException);
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('verifyCredentials', () => {
    it('ok con secret correcto y publica el principal', async () => {
      const secretHash = await bcrypt.hash('s3cret', 4);
      mockFindUnique.mockResolvedValue(
        buildRow({ secretHash, scopes: ['a:b'], lastUsedAt: new Date() }),
      );

      const result = await service.verifyCredentials('cli_abc', 's3cret');

      expect(result).toMatchObject({
        result: 'ok',
        principal: { id: 'cli_abc', scopes: ['a:b'] },
      });
    });

    it('invalid con secret incorrecto', async () => {
      mockFindUnique.mockResolvedValue(
        buildRow({ secretHash: await bcrypt.hash('s3cret', 4) }),
      );

      expect(await service.verifyCredentials('cli_abc', 'otro')).toEqual({
        result: 'invalid',
      });
    });

    it('invalid si el clientId no existe (compara contra un hash descartable, sin lanzar)', async () => {
      mockFindUnique.mockResolvedValue(null);

      expect(await service.verifyCredentials('nadie', 'x')).toEqual({
        result: 'invalid',
      });
      expect(await service.verifyCredentials('nadie', 'y')).toEqual({
        result: 'invalid',
      });
    });

    it('inactive solo si el secret es correcto', async () => {
      const secretHash = await bcrypt.hash('s3cret', 4);
      mockFindUnique.mockResolvedValue(
        buildRow({ secretHash, status: ApiClientStatus.INACTIVE }),
      );

      expect(await service.verifyCredentials('cli_abc', 's3cret')).toEqual({
        result: 'inactive',
        clientId: 'cli_abc',
      });
      expect(await service.verifyCredentials('cli_abc', 'mal')).toEqual({
        result: 'invalid',
      });
    });

    it('refresca lastUsedAt si es null o viejo, y no si es reciente', async () => {
      const secretHash = await bcrypt.hash('s3cret', 4);

      mockFindUnique.mockResolvedValueOnce(buildRow({ secretHash }));
      await service.verifyCredentials('cli_abc', 's3cret');
      expect(mockUpdate).toHaveBeenCalledTimes(1);

      mockFindUnique.mockResolvedValueOnce(
        buildRow({ secretHash, lastUsedAt: new Date() }),
      );
      await service.verifyCredentials('cli_abc', 's3cret');
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });

  describe('regenerateSecret', () => {
    it('rota el hash y el anterior deja de validar', async () => {
      const oldHash = await bcrypt.hash('viejo', 4);
      mockFindUnique.mockResolvedValue(buildRow({ secretHash: oldHash }));
      mockUpdate.mockImplementation(
        ({ data }: { data: Record<string, unknown> }) =>
          Promise.resolve(buildRow(data)),
      );

      const result = await service.regenerateSecret('ref-1', 'admin');

      const newHash = mockUpdate.mock.calls[0][0].data.secretHash as string;
      expect(await bcrypt.compare('viejo', newHash)).toBe(false);
      expect(await bcrypt.compare(result.clientSecret as string, newHash)).toBe(
        true,
      );
      expect(mockUpdate.mock.calls[0][0].data.secretRotatedAt).toBeInstanceOf(
        Date,
      );
    });

    it('rota también el signing secret si HMAC está activo', async () => {
      mockFindUnique.mockResolvedValue(buildRow({ hmacEnabled: true }));
      mockUpdate.mockResolvedValue(buildRow({ hmacEnabled: true }));

      const result = await service.regenerateSecret('ref-1');

      expect(result.signingSecret).toBeDefined();
      expect(mockUpdate.mock.calls[0][0].data.signingSecretEnc).toBe(
        `enc(${result.signingSecret})`,
      );
    });

    it('rechaza credenciales inactivas y no encontradas', async () => {
      mockFindUnique.mockResolvedValueOnce(
        buildRow({ status: ApiClientStatus.INACTIVE }),
      );
      await expect(service.regenerateSecret('ref-1')).rejects.toThrow(
        ConflictException,
      );

      mockFindUnique.mockResolvedValueOnce(null);
      await expect(service.regenerateSecret('nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleStatus', () => {
    it('exige motivo', async () => {
      await expect(
        service.toggleStatus('ref-1', ApiClientStatus.INACTIVE, '  '),
      ).rejects.toThrow(BadRequestException);
    });

    it('actualiza estado, motivo y operador', async () => {
      mockFindUnique.mockResolvedValue(buildRow());
      mockUpdate.mockResolvedValue(
        buildRow({ status: ApiClientStatus.INACTIVE }),
      );

      const result = await service.toggleStatus(
        'ref-1',
        ApiClientStatus.INACTIVE,
        'baja',
        'admin',
      );

      expect(result.status).toBe(ApiClientStatus.INACTIVE);
      expect(mockUpdate.mock.calls[0][0].data).toMatchObject({
        status: ApiClientStatus.INACTIVE,
        changedReason: 'baja',
        lastChangedBy: 'admin',
      });
    });
  });

  describe('updateSettings', () => {
    it('activar HMAC genera signing secret; desactivarlo lo elimina', async () => {
      mockFindUnique.mockResolvedValueOnce(buildRow());
      const enabled = await service.updateSettings('ref-1', {
        hmacEnabled: true,
      });
      expect(enabled.signingSecret).toBeDefined();
      expect(mockUpdate.mock.calls[0][0].data.signingSecretEnc).toBe(
        `enc(${enabled.signingSecret})`,
      );

      mockFindUnique.mockResolvedValueOnce(buildRow({ hmacEnabled: true }));
      const disabled = await service.updateSettings('ref-1', {
        hmacEnabled: false,
      });
      expect(disabled.signingSecret).toBeUndefined();
      expect(mockUpdate.mock.calls[1][0].data.signingSecretEnc).toBeNull();
    });

    it('null en rateLimitPerMinute se propaga para borrar el límite propio', async () => {
      mockFindUnique.mockResolvedValue(buildRow({ rateLimitPerMinute: 10 }));

      await service.updateSettings('ref-1', { rateLimitPerMinute: null });

      expect(mockUpdate.mock.calls[0][0].data.rateLimitPerMinute).toBeNull();
    });
  });

  describe('findAllPaged', () => {
    it('pagina con skip/take y devuelve detalle sin hash', async () => {
      mockTransaction.mockResolvedValue([[buildRow()], 21]);

      const result = await service.findAllPaged({
        page: 3,
        pageSize: 10,
        search: 'dem',
      });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.total).toBe(21);
      expect(result.items[0]).not.toHaveProperty('secretHash');
    });
  });

  describe('getSigningSecret', () => {
    it('devuelve null si HMAC no está activo y descifra si lo está', async () => {
      mockFindUnique.mockResolvedValueOnce({
        hmacEnabled: false,
        signingSecretEnc: null,
      });
      expect(await service.getSigningSecret('cli_abc')).toBeNull();

      mockFindUnique.mockResolvedValueOnce({
        hmacEnabled: true,
        signingSecretEnc: 'enc',
      });
      mockDecrypt.mockReturnValue('plain');
      expect(await service.getSigningSecret('cli_abc')).toBe('plain');
    });
  });
});
