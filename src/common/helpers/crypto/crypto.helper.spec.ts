import { randomBytes } from 'crypto';
import {
  decryptAesGcm,
  encryptAesGcm,
  getKeyId,
  parseKeyring,
  rotateAesGcm,
} from './aes-gcm.helper';
import { hmacSha256Hex, safeEqual, verifyHmacSha256 } from './hmac.helper';

const b64Key = () => randomBytes(32).toString('base64');

describe('hmac.helper', () => {
  it('genera HMAC determinístico y lo verifica', () => {
    const mac = hmacSha256Hex('data', 'secret');
    expect(mac).toHaveLength(64);
    expect(verifyHmacSha256('data', 'secret', mac)).toBe(true);
  });

  it('rechaza datos, secreto o firma distintos', () => {
    const mac = hmacSha256Hex('data', 'secret');
    expect(verifyHmacSha256('other', 'secret', mac)).toBe(false);
    expect(verifyHmacSha256('data', 'other', mac)).toBe(false);
    expect(verifyHmacSha256('data', 'secret', 'short')).toBe(false);
  });

  it('safeEqual no lanza con longitudes distintas', () => {
    expect(safeEqual('a', 'ab')).toBe(false);
    expect(safeEqual('ab', 'ab')).toBe(true);
  });
});

describe('aes-gcm.helper', () => {
  const keyring = parseKeyring(`k1:${b64Key()},k2:${b64Key()}`);

  it('cifra y descifra con formato v1:keyId:iv:tag:ct', () => {
    const payload = encryptAesGcm('secreto ñ', keyring, 'k1');
    expect(payload.split(':')).toHaveLength(5);
    expect(getKeyId(payload)).toBe('k1');
    expect(decryptAesGcm(payload, keyring)).toBe('secreto ñ');
  });

  it('usa IV aleatorio (mismo texto, distinto payload)', () => {
    expect(encryptAesGcm('x', keyring, 'k1')).not.toBe(
      encryptAesGcm('x', keyring, 'k1'),
    );
  });

  it('rota de k1 a k2 conservando el texto', () => {
    const old = encryptAesGcm('dato', keyring, 'k1');
    const rotated = rotateAesGcm(old, keyring, 'k2');
    expect(getKeyId(rotated)).toBe('k2');
    expect(decryptAesGcm(rotated, keyring)).toBe('dato');
    expect(rotateAesGcm(rotated, keyring, 'k2')).toBe(rotated);
  });

  it('detecta manipulación y claves desconocidas', () => {
    const payload = encryptAesGcm('dato', keyring, 'k1');
    const parts = payload.split(':');
    parts[4] = Buffer.from('tampered').toString('base64url');
    expect(() => decryptAesGcm(parts.join(':'), keyring)).toThrow();
    expect(() =>
      decryptAesGcm(payload, parseKeyring(`k9:${b64Key()}`)),
    ).toThrow('Clave de cifrado desconocida');
    expect(() => decryptAesGcm('v2:a:b:c:d', keyring)).toThrow('Formato');
  });

  it('valida el keyring', () => {
    expect(parseKeyring('').size).toBe(0);
    expect(() => parseKeyring('k1:abc')).toThrow('32 bytes');
    expect(() => parseKeyring('sinseparador')).toThrow('inválido');
  });
});
