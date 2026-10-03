import { redactDeep } from './redaction';

/**
 * Patrón: sanitizar en el borde del log. Redacta claves sensibles (anidadas) y reemplaza
 * payloads grandes por metadata + preview truncado para no inflar logs ni filtrar datos.
 */
export const MAX_LOG_PAYLOAD_BYTES = 10 * 1024;
const PREVIEW_CHARS = 512;

export interface TruncatedPayloadInfo {
  contentType: string;
  contentLength: number;
  bodyLogged: false;
  preview: string;
}

export function formatPayload(
  payload: unknown,
  maxBytes = MAX_LOG_PAYLOAD_BYTES,
): unknown {
  if (payload === undefined || payload === null || payload === '') return null;

  const safe = redactDeep(payload);
  let json: string;
  try {
    json = JSON.stringify(safe) ?? '';
  } catch {
    return { bodyLogged: false, preview: '[unserializable]' };
  }

  const contentLength = Buffer.byteLength(json, 'utf8');
  if (contentLength > maxBytes) {
    const info: TruncatedPayloadInfo = {
      contentType: 'application/json',
      contentLength,
      bodyLogged: false,
      preview: json.slice(0, PREVIEW_CHARS),
    };
    return info;
  }
  return safe;
}
