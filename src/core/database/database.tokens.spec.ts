import { RawQueryExecutorService } from './base/sequelize/raw-query-executor.service';
import {
  getConnectionToken,
  getRawQueryExecutorToken,
} from './database.tokens';
import { DatabaseConnections } from './enum/database.enum';

describe('database.tokens', () => {
  it('la conexión default usa DatabaseConnections.DEFAULT y la clase del executor', () => {
    expect(getConnectionToken()).toBe(DatabaseConnections.DEFAULT);
    expect(getRawQueryExecutorToken()).toBe(RawQueryExecutorService);
    expect(getRawQueryExecutorToken(DatabaseConnections.DEFAULT)).toBe(
      RawQueryExecutorService,
    );
  });

  it('una conexión nombrada usa su nombre y un token string propio para el executor', () => {
    expect(getConnectionToken('REPORTS_DB')).toBe('REPORTS_DB');
    expect(getRawQueryExecutorToken('REPORTS_DB')).toBe(
      'REPORTS_DB_RAW_QUERY_EXECUTOR',
    );
  });
});
