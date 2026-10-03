import { hmacSha256Hex, safeEqual, sha256Hex } from './hmac.helper';

/**
 * Patrón: protocolo de firma de requests compartido por servidor (HmacSignatureGuard) y cliente
 * (HmacAuthStrategy): una única definición del string firmado (DRY) evita que ambos lados diverjan.
 *
 * String firmado: `METHOD\npath\ntimestamp\nsha256(body)`. `path` incluye la query tal como viaja
 * (originalUrl). Si el request lleva nonce se agrega como 5ª línea: así un atacante no puede
 * reusar una firma capturada cambiando solo el header X-Nonce.
 */
export const SIGNATURE_HEADERS = {
  signature: 'x-signature',
  timestamp: 'x-timestamp',
  nonce: 'x-nonce',
} as const;

export interface SignatureParts {
  method: string;
  /** Path + query exactamente como se envía (p. ej. `/api/v1/m2m/echo?x=1`). */
  path: string;
  /** Epoch en segundos, como string. */
  timestamp: string;
  body?: string | Buffer;
  nonce?: string;
}

export function buildSigningString(parts: SignatureParts): string {
  const lines = [
    parts.method.toUpperCase(),
    parts.path,
    parts.timestamp,
    sha256Hex(parts.body ?? ''),
  ];
  if (parts.nonce) lines.push(parts.nonce);
  return lines.join('\n');
}

export function signRequest(secret: string, parts: SignatureParts): string {
  return hmacSha256Hex(buildSigningString(parts), secret);
}

export function verifyRequestSignature(
  secret: string,
  parts: SignatureParts,
  signatureHex: string,
): boolean {
  return safeEqual(signRequest(secret, parts), signatureHex);
}

/** `true` si el timestamp (epoch segundos) está dentro de ±`windowSeconds` de `nowMs`. */
export function isTimestampInWindow(
  timestamp: string,
  windowSeconds: number,
  nowMs: number = Date.now(),
): boolean {
  if (!/^\d{1,12}$/.test(timestamp)) return false;
  return Math.abs(nowMs / 1000 - Number(timestamp)) <= windowSeconds;
}
