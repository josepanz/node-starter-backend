import { formatPayload } from './payload-formatter';
import {
  buildRedactPaths,
  REDACT_PATHS,
  REDACTED,
  redactDeep,
} from './redaction';

describe('redaction', () => {
  it('genera paths anidados para cada clave sensible', () => {
    expect(REDACT_PATHS).toEqual(
      expect.arrayContaining([
        'password',
        '*.password',
        '*.*.token',
        'req.headers.authorization',
        'req.headers.cookie',
      ]),
    );
    expect(buildRedactPaths(['x']).length).toBeGreaterThan(1);
  });

  it('redactDeep oculta claves sensibles a cualquier nivel', () => {
    const out = redactDeep({
      user: 'a',
      auth: { password: '1', nested: [{ apiToken: '2' }] },
    });
    expect(out).toEqual({
      user: 'a',
      auth: { password: REDACTED, nested: [{ apiToken: REDACTED }] },
    });
  });

  it('formatPayload trunca payloads grandes con metadata y preview', () => {
    const big = { data: 'x'.repeat(5000) };
    const out = formatPayload(big, 1000) as Record<string, unknown>;
    expect(out.bodyLogged).toBe(false);
    expect(out.contentLength).toBeGreaterThan(1000);
    expect((out.preview as string).length).toBeLessThanOrEqual(512);
  });

  it('formatPayload devuelve null para vacíos y el payload redactado si es chico', () => {
    expect(formatPayload(undefined)).toBeNull();
    expect(formatPayload({ secret: 's', a: 1 })).toEqual({
      secret: REDACTED,
      a: 1,
    });
  });
});
