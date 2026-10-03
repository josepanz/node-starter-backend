import { TransientConnectionErrorHelper } from './transient-connection-error.helper';

describe('TransientConnectionErrorHelper', () => {
  it.each(['ECONNRESET', 'ETIMEDOUT', '53300', '57P03', 'P2024'])(
    'detecta el código %s como transitorio',
    (code) => {
      // Arrange
      const error = Object.assign(new Error('boom'), { code });
      // Act + Assert
      expect(TransientConnectionErrorHelper.isTransient(error)).toBe(true);
    },
  );

  it('detecta timeouts del pool por mensaje', () => {
    const error = new Error('timeout exceeded when trying to connect');
    expect(TransientConnectionErrorHelper.isTransient(error)).toBe(true);
  });

  it('detecta errorCode de Prisma y causas anidadas', () => {
    const error = new Error('wrapper', { cause: { errorCode: 'P1001' } });
    expect(TransientConnectionErrorHelper.isTransient(error)).toBe(true);
  });

  it('no clasifica errores de aplicación', () => {
    expect(TransientConnectionErrorHelper.isTransient(new Error('x'))).toBe(
      false,
    );
    expect(TransientConnectionErrorHelper.isTransient({ code: '23505' })).toBe(
      false,
    );
    expect(TransientConnectionErrorHelper.isTransient(undefined)).toBe(false);
  });
});
