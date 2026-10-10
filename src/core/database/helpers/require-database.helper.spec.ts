import { ServiceUnavailableException } from '@nestjs/common';
import { requireDatabase } from './require-database.helper';

describe('requireDatabase', () => {
  it('devuelve la dependencia cuando existe', () => {
    const service = { ok: true };

    expect(requireDatabase(service)).toBe(service);
  });

  it('lanza 503 cuando Sequelize no está configurado', () => {
    expect(() => requireDatabase(undefined)).toThrow(
      ServiceUnavailableException,
    );
  });
});
