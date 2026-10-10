import {
  buildSigningString,
  isTimestampInWindow,
  signRequest,
  verifyRequestSignature,
} from './request-signature.helper';

describe('request-signature.helper', () => {
  const base = {
    method: 'post',
    path: '/api/v1/m2m/echo?x=1',
    timestamp: '1760000000',
    body: '{"a":1}',
  };

  it('arma el string firmado con método en mayúsculas y hash del body', () => {
    const lines = buildSigningString(base).split('\n');

    expect(lines).toHaveLength(4);
    expect(lines.slice(0, 3)).toEqual(['POST', base.path, base.timestamp]);
    expect(lines[3]).toHaveLength(64);
  });

  it('agrega el nonce como quinta línea solo si existe', () => {
    expect(buildSigningString({ ...base, nonce: 'abcdefgh' })).toMatch(
      /\nabcdefgh$/,
    );
    expect(buildSigningString(base).split('\n')).toHaveLength(4);
  });

  it('firma y verifica; rechaza cambios en body, path, secreto o nonce', () => {
    const signature = signRequest('s3cret', base);

    expect(verifyRequestSignature('s3cret', base, signature)).toBe(true);
    expect(
      verifyRequestSignature('s3cret', { ...base, body: '{"a":2}' }, signature),
    ).toBe(false);
    expect(
      verifyRequestSignature('s3cret', { ...base, path: '/other' }, signature),
    ).toBe(false);
    expect(verifyRequestSignature('otro', base, signature)).toBe(false);
    expect(
      verifyRequestSignature(
        's3cret',
        { ...base, nonce: 'abcdefgh' },
        signature,
      ),
    ).toBe(false);
  });

  it('un body ausente equivale a body vacío', () => {
    expect(buildSigningString({ ...base, body: undefined })).toBe(
      buildSigningString({ ...base, body: '' }),
    );
  });

  describe('isTimestampInWindow', () => {
    const now = 1_760_000_000_000;

    it('acepta dentro de la ventana y rechaza fuera de ella', () => {
      expect(isTimestampInWindow('1760000100', 300, now)).toBe(true);
      expect(isTimestampInWindow('1759999800', 300, now)).toBe(true);
      expect(isTimestampInWindow('1760000301', 300, now)).toBe(false);
      expect(isTimestampInWindow('1759999000', 300, now)).toBe(false);
    });

    it('rechaza formatos no numéricos', () => {
      expect(isTimestampInWindow('abc', 300, now)).toBe(false);
      expect(isTimestampInWindow('', 300, now)).toBe(false);
      expect(isTimestampInWindow('1.7e9', 300, now)).toBe(false);
    });
  });
});
