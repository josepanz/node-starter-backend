import { UnprocessableEntityException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import {
  allowedTransitions,
  assertTransition,
  canTransition,
  isTerminalStatus,
} from './order-state-machine.helper';
import { calculateFee, FeeCalculator } from './fee-calculator';

describe('order-state-machine.helper', () => {
  it.each([
    [OrderStatus.PENDING, OrderStatus.CONFIRMED],
    [OrderStatus.PENDING, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED, OrderStatus.COMPLETED],
    [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  ])('permite %s -> %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(() => assertTransition(from, to)).not.toThrow();
  });

  it.each([
    [OrderStatus.PENDING, OrderStatus.COMPLETED],
    [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.CANCELLED, OrderStatus.PENDING],
    [OrderStatus.PENDING, OrderStatus.PENDING],
  ])('rechaza %s -> %s con 422', (from, to) => {
    expect(() => assertTransition(from, to)).toThrow(
      UnprocessableEntityException,
    );
  });

  it('expone transiciones permitidas y estados terminales', () => {
    expect(allowedTransitions(OrderStatus.PENDING)).toHaveLength(2);
    expect(isTerminalStatus(OrderStatus.COMPLETED)).toBe(true);
    expect(isTerminalStatus(OrderStatus.CONFIRMED)).toBe(false);
  });
});

describe('FeeCalculator', () => {
  const config = { percentage: 2.5, minimum: 1 };

  it('aplica el porcentaje cuando supera el mínimo', () => {
    expect(calculateFee('100', config).toFixed(2)).toBe('2.50');
  });

  it('aplica el mínimo cuando el porcentaje queda por debajo', () => {
    expect(calculateFee('10', config).toFixed(2)).toBe('1.00');
  });

  it('redondea half-up a 2 decimales', () => {
    expect(
      calculateFee('100.10', { percentage: 5, minimum: 0 }).toFixed(2),
    ).toBe(
      '5.01', // 5.005 -> 5.01
    );
  });

  it('el adapter inyectable usa la configuración de la app', () => {
    const calculator = new FeeCalculator({
      orders: { feePercentage: 10, feeMinimum: 0.5 },
    } as never);
    expect(calculator.calculate('50').toFixed(2)).toBe('5.00');
  });
});
