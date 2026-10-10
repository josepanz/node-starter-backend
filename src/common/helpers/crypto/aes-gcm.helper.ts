import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * Patrón: envelope versionado + keyring (rotación de claves). Formato
 * `v1:<keyId>:<iv>:<tag>:<ciphertext>` (partes en base64url). El `keyId` viaja con el dato,
 * así se puede rotar la clave activa sin perder la capacidad de descifrar datos viejos.
 * AES-256-GCM aporta confidencialidad + integridad (tag de autenticación).
 */
export const ENCRYPTION_FORMAT_VERSION = 'v1';
const KEY_BYTES = 32;
const IV_BYTES = 12;

export type Keyring = ReadonlyMap<string, Buffer>;

/**
 * Parsea `"id:base64Key,id2:base64Key"`. Valida que cada clave tenga 32 bytes.
 * Un string vacío devuelve un keyring vacío (cifrado no configurado, no es un error acá).
 */
export function parseKeyring(raw: string | undefined): Keyring {
  const ring = new Map<string, Buffer>();
  for (const entry of (raw ?? '').split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    const separator = trimmed.indexOf(':');
    const id = trimmed.slice(0, separator);
    const key = Buffer.from(trimmed.slice(separator + 1), 'base64');
    if (separator <= 0 || !/^[A-Za-z0-9_-]+$/.test(id)) {
      throw new Error(
        'Keyring inválido: id de clave ausente o con caracteres no permitidos',
      );
    }
    if (key.length !== KEY_BYTES) {
      throw new Error(
        `Keyring inválido: la clave "${id}" debe tener ${KEY_BYTES} bytes`,
      );
    }
    ring.set(id, key);
  }
  return ring;
}

function requireKey(keyring: Keyring, keyId: string): Buffer {
  const key = keyring.get(keyId);
  if (!key) throw new Error(`Clave de cifrado desconocida: ${keyId}`);
  return key;
}

export function encryptAesGcm(
  plaintext: string,
  keyring: Keyring,
  activeKeyId: string,
): string {
  const key = requireKey(keyring, activeKeyId);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_FORMAT_VERSION,
    activeKeyId,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join(':');
}

/** Extrae el keyId de un payload cifrado (útil para detectar datos a re-cifrar). */
export function getKeyId(payload: string): string | undefined {
  const parts = payload.split(':');
  return parts.length === 5 && parts[0] === ENCRYPTION_FORMAT_VERSION
    ? parts[1]
    : undefined;
}

export function decryptAesGcm(payload: string, keyring: Keyring): string {
  const [version, keyId, iv, tag, ciphertext, ...extra] = payload.split(':');
  if (
    version !== ENCRYPTION_FORMAT_VERSION ||
    !keyId ||
    !iv ||
    !tag ||
    !ciphertext ||
    extra.length
  ) {
    throw new Error('Formato de payload cifrado no soportado');
  }
  const decipher = createDecipheriv(
    'aes-256-gcm',
    requireKey(keyring, keyId),
    Buffer.from(iv, 'base64url'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

/** Descifra con la clave que declare el payload y re-cifra con la activa (rotación). */
export function rotateAesGcm(
  payload: string,
  keyring: Keyring,
  activeKeyId: string,
): string {
  return getKeyId(payload) === activeKeyId
    ? payload
    : encryptAesGcm(decryptAesGcm(payload, keyring), keyring, activeKeyId);
}
