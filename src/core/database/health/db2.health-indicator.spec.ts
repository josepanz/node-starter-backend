import { QueryTypes } from '@sequelize/core';
import { createSequelizeServiceMock } from '../../../../test/mocks/sequelize.mock';
import { Db2HealthIndicator } from './db2.health-indicator';

const buildIndicator = (
  mock: ReturnType<typeof createSequelizeServiceMock>,
) => {
  const session = {
    up: jest.fn().mockReturnValue({ db2: { status: 'up' } }),
    down: jest.fn().mockReturnValue({ db2: { status: 'down' } }),
  };
  const healthIndicatorService = { check: jest.fn().mockReturnValue(session) };
  return {
    session,
    indicator: new Db2HealthIndicator(
      healthIndicatorService as never,
      mock.service as never,
    ),
  };
};

describe('Db2HealthIndicator', () => {
  it('sondea SYSIBM.SYSDUMMY1 en dialecto IBM i y reporta up', async () => {
    const mock = createSequelizeServiceMock();
    mock.query.mockResolvedValue([{ 1: 1 }]);
    const { indicator, session } = buildIndicator(mock);

    await indicator.check();

    expect(mock.query).toHaveBeenCalledWith('SELECT 1 FROM SYSIBM.SYSDUMMY1', {
      type: QueryTypes.SELECT,
    });
    expect(session.up).toHaveBeenCalled();
  });

  it('reporta down sin filtrar el detalle del error', async () => {
    const mock = createSequelizeServiceMock();
    mock.query.mockRejectedValue(new Error('SQL0204 APPLIB.X not found'));
    const { indicator, session } = buildIndicator(mock);

    await indicator.check();

    expect(session.down).toHaveBeenCalledWith({
      message: 'DB2 no disponible',
    });
  });
});
