export class CardHelper {
  static obfuscateCardNumber(cardNumber: unknown): string {
    if (cardNumber === null || cardNumber === undefined) {
      return '';
    }

    if (
      typeof cardNumber !== 'string' &&
      typeof cardNumber !== 'number' &&
      typeof cardNumber !== 'bigint'
    ) {
      return '';
    }

    const raw = String(cardNumber).trim();
    if (!raw) {
      return '';
    }

    const digits = raw.replace(/\D/g, '');

    if (digits.length < 14 || digits.length > 19) {
      return raw;
    }

    const firstSix = digits.slice(0, 6);
    const lastFour = digits.slice(-4);
    const maskedMiddle = '*'.repeat(digits.length - 10);

    return `${firstSix}${maskedMiddle}${lastFour}`;
  }
}
