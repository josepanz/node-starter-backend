export class FormatHelper {
  static formatDate(date: Date | string | null | undefined): string {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
  }

  static formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${parsedDate.getFullYear()}-${pad(parsedDate.getMonth() + 1)}-${pad(parsedDate.getDate())} ${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}:${pad(parsedDate.getSeconds())}`;
  }

  static formatTime(date: Date | string | null | undefined): string {
    if (!date) return '';

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(parsedDate.getHours())}:${pad(parsedDate.getMinutes())}`;
  }

  static formatThousands(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';

    const normalizedValue =
      typeof value === 'number' ? value.toString() : value.trim();

    const isNegative = normalizedValue.startsWith('-');
    const unsignedValue = isNegative
      ? normalizedValue.slice(1)
      : normalizedValue;

    if (!/^[\d.,]+$/.test(unsignedValue)) return normalizedValue;

    let integerPart = unsignedValue;
    let decimalPart: string | undefined;

    const hasComma = unsignedValue.includes(',');
    const hasDot = unsignedValue.includes('.');

    if (hasComma && hasDot) {
      const lastCommaIndex = unsignedValue.lastIndexOf(',');
      const lastDotIndex = unsignedValue.lastIndexOf('.');
      const decimalSeparator = lastCommaIndex > lastDotIndex ? ',' : '.';
      const parts = unsignedValue.split(decimalSeparator);
      const rawInteger = parts[0] ?? '';
      const rawDecimal = parts.slice(1).join('');
      integerPart = rawInteger.replace(/[.,]/g, '');
      decimalPart = rawDecimal || undefined;
    } else if (hasComma) {
      const commaParts = unsignedValue.split(',');
      const looksLikeThousands = commaParts.every((part, index) =>
        index === 0 ? part.length >= 1 && part.length <= 3 : part.length === 3,
      );

      if (looksLikeThousands) {
        integerPart = commaParts.join('');
      } else {
        integerPart = commaParts[0]?.replace(/[.,]/g, '') ?? '';
        decimalPart = commaParts.slice(1).join('') || undefined;
      }
    } else if (hasDot) {
      const dotParts = unsignedValue.split('.');
      const looksLikeThousands = dotParts.every((part, index) =>
        index === 0 ? part.length >= 1 && part.length <= 3 : part.length === 3,
      );

      if (looksLikeThousands) {
        integerPart = dotParts.join('');
      } else {
        integerPart = dotParts[0]?.replace(/[.,]/g, '') ?? '';
        decimalPart = dotParts.slice(1).join('') || undefined;
      }
    }

    if (!/^\d+$/.test(integerPart)) return normalizedValue;

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const signedValue = isNegative ? `-${formattedInteger}` : formattedInteger;

    return decimalPart ? `${signedValue},${decimalPart}` : signedValue;
  }
}
