import { BadRequestException } from '@nestjs/common';
import {
  computeRequestHash,
  readIdempotencyKey,
  stableStringify,
} from './idempotency.helper';

describe('idempotency.helper', () => {
  it('lee una key válida y devuelve undefined si no viene', () => {
    expect(readIdempotencyKey({ 'idempotency-key': 'abc-12345678' })).toBe(
      'abc-12345678',
    );
    expect(readIdempotencyKey({})).toBeUndefined();
  });

  it('rechaza keys inválidas', () => {
    expect(() => readIdempotencyKey({ 'idempotency-key': 'short' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      readIdempotencyKey({ 'idempotency-key': 'bad key with spaces!' }),
    ).toThrow(BadRequestException);
  });

  it('stableStringify ignora el orden de claves y undefined', () => {
    expect(stableStringify({ b: 1, a: [2, { d: 1, c: undefined }] })).toBe(
      stableStringify({ a: [2, { d: 1 }], b: 1 }),
    );
  });

  it('computeRequestHash es estable, depende del payload y usa HMAC con secreto', () => {
    expect(computeRequestHash({ a: 1, b: 2 }, 's')).toBe(
      computeRequestHash({ b: 2, a: 1 }, 's'),
    );
    expect(computeRequestHash({ a: 1 }, 's')).not.toBe(
      computeRequestHash({ a: 2 }, 's'),
    );
    expect(computeRequestHash({ a: 1 }, 's')).not.toBe(
      computeRequestHash({ a: 1 }),
    );
  });
});
