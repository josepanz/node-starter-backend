import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Patrón: normalización de dinero en el borde. Todo monto se maneja como Decimal (nunca
 * `number`) y se redondea a una escala fija con una regla explícita (half-up); hacia el
 * cliente se expone como string para no perder precisión en JSON.
 */
export type DecimalInput = Prisma.Decimal | string | number;

export const DEFAULT_MONEY_SCALE = 2;

export function toDecimal(value: DecimalInput): Prisma.Decimal {
  try {
    const decimal = new Prisma.Decimal(value);
    if (!decimal.isFinite()) throw new Error('not finite');
    return decimal;
  } catch {
    throw new BadRequestException('Monto inválido.');
  }
}

export function normalizeDecimal(
  value: DecimalInput,
  scale: number = DEFAULT_MONEY_SCALE,
): Prisma.Decimal {
  return toDecimal(value).toDecimalPlaces(scale, Prisma.Decimal.ROUND_HALF_UP);
}

export function decimalToString(
  value: DecimalInput,
  scale: number = DEFAULT_MONEY_SCALE,
): string {
  return normalizeDecimal(value, scale).toFixed(scale);
}
