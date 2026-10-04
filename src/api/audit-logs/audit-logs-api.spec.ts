import { JsonStreamHelper } from '@common/helpers/json-stream.helper';
import { AuditLogsApiService } from './services/audit-logs-api.service';

async function* rows() {
  await Promise.resolve();
  yield { id: '1' };
  yield { id: '2' };
}

describe('AuditLogsApiService', () => {
  const auditLogs = {
    list: jest.fn(),
    iterate: jest.fn(),
    getRecentAccess: jest.fn(),
  };
  const config = { audit: { exportBatchSize: 250 } } as never;
  const service = new AuditLogsApiService(auditLogs as never, config);

  beforeEach(() => jest.clearAllMocks());

  it('list: separa paginación de filtros y arma la respuesta paginada', async () => {
    auditLogs.list.mockResolvedValue({ items: [{ id: '1' }], total: 21 });

    const result = await service.list({
      page: 2,
      pageSize: 10,
      tableName: 'users',
    });

    expect(auditLogs.list).toHaveBeenCalledWith({ tableName: 'users' }, 2, 10);
    expect(result.pagination).toMatchObject({ total: 21, totalPages: 3 });
  });

  it('buildExport: usa el lote de la config y emite items + total por streaming', async () => {
    auditLogs.iterate.mockReturnValue(rows());

    const doc = service.buildExport({ tableName: 'users' });
    const chunks: Buffer[] = [];
    for await (const c of JsonStreamHelper.stream(doc)) chunks.push(c);
    const json = JSON.parse(Buffer.concat(chunks).toString('utf-8')) as unknown;

    expect(auditLogs.iterate).toHaveBeenCalledWith({ tableName: 'users' }, 250);
    expect(json).toMatchObject({ items: [{ id: '1' }, { id: '2' }], total: 2 });
  });
});
