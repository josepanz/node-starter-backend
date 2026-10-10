import { QueryTypes } from '@sequelize/core';
import { createSequelizeServiceMock } from '../../../../../test/mocks/sequelize.mock';
import { RawQueryExecutorService } from './raw-query-executor.service';

describe('RawQueryExecutorService', () => {
  let executor: RawQueryExecutorService;
  let mock: ReturnType<typeof createSequelizeServiceMock>;

  beforeEach(() => {
    mock = createSequelizeServiceMock();
    executor = new RawQueryExecutorService(mock.service as never);
  });

  it('ejecuta SELECT por defecto y pasa replacements, bind y plain', async () => {
    mock.query.mockResolvedValue({ a: 1 });

    const result = await executor.executeRawQuery('SELECT 1', {
      replacements: { x: 1 },
      bind: ['{}'],
      plain: true,
    });

    expect(result).toEqual({ a: 1 });
    expect(mock.query).toHaveBeenCalledWith(
      'SELECT 1',
      expect.objectContaining({
        type: QueryTypes.SELECT,
        replacements: { x: 1 },
        bind: ['{}'],
        plain: true,
        logging: false,
      }),
    );
  });

  it('executeAffectedRows usa BULKUPDATE y devuelve un número', async () => {
    mock.query.mockResolvedValueOnce(3).mockResolvedValueOnce(undefined);

    await expect(
      executor.executeAffectedRows('UPDATE X SET A = 1'),
    ).resolves.toBe(3);
    await expect(
      executor.executeAffectedRows('UPDATE X SET A = 1'),
    ).resolves.toBe(0);
    expect(mock.query.mock.calls[0][1].type).toBe(QueryTypes.BULKUPDATE);
  });

  it('transaction y beginTransaction delegan en el SequelizeService con opciones', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    await executor.transaction(fn, { readOnly: true });
    await executor.beginTransaction({ readOnly: true });

    expect(mock.service.transaction).toHaveBeenCalledWith(fn, {
      readOnly: true,
    });
    expect(mock.service.beginTransaction).toHaveBeenCalledWith({
      readOnly: true,
    });
  });
});
