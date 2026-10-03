import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { DecimalInput, normalizeDecimal } from '@common/helpers/decimal.helper';

export interface FeeConfig {
  /** Porcentaje sobre el monto (2.5 = 2.5%). */
  percentage: number;
  /** Comisión mínima: nunca se cobra menos que esto. */
  minimum: number;
}

/**
 * Función pura: fee = max(monto * porcentaje / 100, mínimo), redondeado a 2 decimales.
 * Sin I/O ni config global, por eso es trivial de testear.
 */
export function calculateFee(
  amount: DecimalInput,
  config: FeeConfig,
): Prisma.Decimal {
  const percentageFee = normalizeDecimal(amount)
    .mul(new Prisma.Decimal(config.percentage))
    .div(100);
  const minimum = new Prisma.Decimal(config.minimum);
  return normalizeDecimal(Prisma.Decimal.max(percentageFee, minimum));
}

/** Adapter inyectable que alimenta `calculateFee` con la configuración de la app. */
@Injectable()
export class FeeCalculator {
  constructor(
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  calculate(amount: DecimalInput): Prisma.Decimal {
    return calculateFee(amount, {
      percentage: this.config.orders.feePercentage,
      minimum: this.config.orders.feeMinimum,
    });
  }
}
