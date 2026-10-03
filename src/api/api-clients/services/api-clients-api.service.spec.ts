import { ApiClientStatus } from '@prisma/client';
import { ApiClientsApiService } from './api-clients-api.service';

const mockCreate = jest.fn();
const mockFindAllPaged = jest.fn();
const mockFindOne = jest.fn();
const mockToggleStatus = jest.fn();
const mockRegenerateSecret = jest.fn();
const mockUpdateSettings = jest.fn();

const detail = {
  referenceId: 'ref-1',
  clientId: 'cli_abc',
  clientName: 'Demo',
  status: ApiClientStatus.ACTIVE,
  scopes: ['demo:read'],
  rateLimitPerMinute: null,
  allowedIps: [],
  hmacEnabled: false,
  lastUsedAt: null,
  secretRotatedAt: null,
  createdAt: new Date('2026-01-01'),
  lastChangedAt: null,
  createdBy: 'admin@test.com',
  lastChangedBy: null,
  changedReason: null,
};

describe('ApiClientsApiService', () => {
  let service: ApiClientsApiService;

  beforeEach(() => {
    service = new ApiClientsApiService({
      create: mockCreate,
      findAllPaged: mockFindAllPaged,
      findOne: mockFindOne,
      toggleStatus: mockToggleStatus,
      regenerateSecret: mockRegenerateSecret,
      updateSettings: mockUpdateSettings,
    } as never);
  });

  afterEach(() => jest.clearAllMocks());

  it('create pasa el operador como createdBy y devuelve los secretos', async () => {
    mockCreate.mockResolvedValue({
      client: detail,
      clientSecret: 'plain',
      signingSecret: undefined,
    });

    const result = await service.create(
      { scopes: ['demo:read'], clientName: 'Demo' },
      'admin@test.com',
    );

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ createdBy: 'admin@test.com' }),
    );
    expect(result.clientSecret).toBe('plain');
    expect(result.client.clientId).toBe('cli_abc');
  });

  it('list arma la paginación', async () => {
    mockFindAllPaged.mockResolvedValue({ items: [detail], total: 21 });

    const result = await service.list({ page: 2, pageSize: 10 });

    expect(result.pagination).toEqual({
      total: 21,
      page: 2,
      pageSize: 10,
      totalPages: 3,
    });
    expect(result.data).toHaveLength(1);
  });

  it('toggleStatus y updateSettings propagan operador y motivo', async () => {
    mockToggleStatus.mockResolvedValue({
      ...detail,
      status: ApiClientStatus.INACTIVE,
    });
    mockUpdateSettings.mockResolvedValue({ client: detail });

    await service.toggleStatus(
      'ref-1',
      { status: ApiClientStatus.INACTIVE, changedReason: 'baja' },
      'admin@test.com',
    );
    await service.updateSettings(
      'ref-1',
      { rateLimitPerMinute: null },
      'admin@test.com',
    );

    expect(mockToggleStatus).toHaveBeenCalledWith(
      'ref-1',
      ApiClientStatus.INACTIVE,
      'baja',
      'admin@test.com',
    );
    expect(mockUpdateSettings).toHaveBeenCalledWith('ref-1', {
      rateLimitPerMinute: null,
      operator: 'admin@test.com',
    });
  });

  it('regenerateSecret y findOne delegan en el dominio', async () => {
    mockRegenerateSecret.mockResolvedValue({
      client: detail,
      clientSecret: 'nuevo',
    });
    mockFindOne.mockResolvedValue(detail);

    const rotated = await service.regenerateSecret('ref-1', 'admin@test.com');
    const found = await service.findOne('ref-1');

    expect(rotated.clientSecret).toBe('nuevo');
    expect(found.referenceId).toBe('ref-1');
  });
});
