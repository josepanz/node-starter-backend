const E164_PATTERN = /^\+[1-9]\d{7,14}$/;
const SEPARATORS = /[\s().-]/g;
const PHONE_IN_TEXT_PATTERN = /\+?\d{7,}/g;

/**
 * Patrón: helper puro (KISS). Normaliza teléfonos a E.164 (`+<país><número>`).
 * - Con `+` o prefijo `00`: ya es internacional, solo se valida.
 * - Sin `+`: formato nacional; requiere `defaultCountryCode` (config `PHONE_DEFAULT_COUNTRY_CODE`),
 *   se quita un único `0` inicial (prefijo troncal) y se antepone el país. Sin país configurado
 *   se rechaza: el helper nunca asume un país.
 */
export class PhoneHelper {
  /** @throws Error si no se puede llevar a E.164 */
  static normalize(raw: string, defaultCountryCode?: string): string {
    const cleaned = raw.trim().replace(SEPARATORS, '');
    let candidate: string;

    if (cleaned.startsWith('+')) {
      candidate = cleaned;
    } else if (cleaned.startsWith('00')) {
      candidate = `+${cleaned.slice(2)}`;
    } else if (defaultCountryCode && /^\d+$/.test(cleaned)) {
      candidate = `+${defaultCountryCode}${cleaned.replace(/^0/, '')}`;
    } else {
      throw new Error('Formato de teléfono inválido');
    }

    if (!E164_PATTERN.test(candidate)) {
      throw new Error('Formato de teléfono inválido');
    }
    return candidate;
  }

  static isValid(raw: string, defaultCountryCode?: string): boolean {
    try {
      PhoneHelper.normalize(raw, defaultCountryCode);
      return true;
    } catch {
      return false;
    }
  }

  /** Enmascara dejando solo los últimos 3 dígitos. */
  static mask(phone: string): string {
    return `***${phone.slice(-3)}`;
  }

  /** Enmascara cualquier secuencia que parezca un teléfono dentro de un texto libre (logs). */
  static maskPhonesInText(text: string): string {
    return text.replace(PHONE_IN_TEXT_PATTERN, (match) =>
      PhoneHelper.mask(match),
    );
  }
}
