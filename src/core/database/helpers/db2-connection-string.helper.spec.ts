import { withQueryTimeout } from './db2-connection-string.helper';

describe('withQueryTimeout', () => {
  it('agrega QueryTimeout cuando falta', () => {
    expect(withQueryTimeout('DRIVER={x};UID=u', 30)).toBe(
      'DRIVER={x};UID=u;QueryTimeout=30;',
    );
    expect(withQueryTimeout('DRIVER={x};', 30)).toBe(
      'DRIVER={x};QueryTimeout=30;',
    );
  });

  it('respeta un QueryTimeout ya presente (sin importar mayúsculas)', () => {
    const conn = 'DRIVER={x};querytimeout = 5;';

    expect(withQueryTimeout(conn, 30)).toBe(conn);
  });

  it('no agrega nada con 0 o undefined', () => {
    expect(withQueryTimeout('DRIVER={x};', 0)).toBe('DRIVER={x};');
    expect(withQueryTimeout('DRIVER={x};', undefined)).toBe('DRIVER={x};');
  });
});
