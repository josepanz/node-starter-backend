import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { decimalToString, normalizeDecimal, toDecimal } from './decimal.helper';
import { assertOwnership, isAdminSubject } from './ownership.helper';

describe('decimal.helper', () => {
  it('normaliza con half-up a 2 decimales', () => {
    expect(normalizeDecimal('10.005').toString()).toBe('10.01');
    expect(normalizeDecimal(10.004).toString()).toBe('10');
    expect(normalizeDecimal(new Prisma.Decimal('1.234'), 1).toString()).toBe(
      '1.2',
    );
  });

  it('formatea como string con escala fija', () => {
    expect(decimalToString('5')).toBe('5.00');
    expect(decimalToString('0.1')).toBe('0.10');
  });

  it('rechaza valores no numéricos', () => {
    expect(() => toDecimal('abc')).toThrow(BadRequestException);
    expect(() => toDecimal(Infinity)).toThrow(BadRequestException);
  });
});

describe('assertOwnership', () => {
  const resource = { ownerId: 7 };

  it('permite al dueño (comparando number vs string)', () => {
    expect(() => assertOwnership(resource, { id: 7 })).not.toThrow();
    expect(() => assertOwnership(resource, { id: '7' })).not.toThrow();
  });

  it('permite a un admin aunque no sea dueño', () => {
    expect(() =>
      assertOwnership(resource, { id: 1, permissions: ['admin:all'] }),
    ).not.toThrow();
  });

  it('rechaza a un tercero con 403 o 404 según configuración', () => {
    expect(() => assertOwnership(resource, { id: 1 })).toThrow(
      ForbiddenException,
    );
    expect(() =>
      assertOwnership(resource, { id: 1 }, { denyAs: 'not-found' }),
    ).toThrow(NotFoundException);
  });

  it('soporta ownerField y adminPermissions personalizados', () => {
    expect(() =>
      assertOwnership({ userId: 2 }, { id: 2 }, { ownerField: 'userId' }),
    ).not.toThrow();
    expect(() =>
      assertOwnership(
        { ownerId: 9 },
        { id: 1, permissions: ['custom'] },
        { adminPermissions: ['custom'] },
      ),
    ).not.toThrow();
    expect(isAdminSubject({ id: 1, permissions: [] })).toBe(false);
  });

  it('rechaza si el recurso no tiene campo dueño', () => {
    expect(() => assertOwnership({}, { id: 1 })).toThrow(ForbiddenException);
  });
});
