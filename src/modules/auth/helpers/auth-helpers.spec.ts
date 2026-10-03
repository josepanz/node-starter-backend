import {
  DEFAULT_PASSWORD_POLICY,
  passwordPolicyFromEnv,
  validatePasswordPolicy,
} from './password-policy.helper';
import {
  computePasswordExpiration,
  daysUntilPasswordExpiration,
  isPasswordExpired,
} from './password-expiration.helper';
import {
  evaluateFailedAttempt,
  isLockedOut,
  remainingLockoutMinutes,
} from './login-lockout.helper';

describe('password-policy.helper', () => {
  it('acepta una contraseña que cumple la política por defecto', () => {
    expect(validatePasswordPolicy('Abcdef12')).toEqual({
      valid: true,
      violations: [],
    });
  });

  it('reporta cada violación', () => {
    const { valid, violations } = validatePasswordPolicy('abc');
    expect(valid).toBe(false);
    expect(violations).toHaveLength(3); // largo, mayúscula, dígito
  });

  it('respeta política configurable (símbolo requerido, largo máximo)', () => {
    const policy = {
      ...DEFAULT_PASSWORD_POLICY,
      requireSymbol: true,
      maxLength: 10,
    };
    expect(validatePasswordPolicy('Abcdef12', policy).violations).toEqual([
      'debe incluir un símbolo',
    ]);
    expect(validatePasswordPolicy('Abcdef12!xyz', policy).violations).toContain(
      'no debe superar los 10 caracteres',
    );
  });

  it('lee la política desde env con fallback a defaults', () => {
    const policy = passwordPolicyFromEnv({
      PASSWORD_MIN_LENGTH: '12',
      PASSWORD_REQUIRE_SYMBOL: 'true',
      PASSWORD_REQUIRE_DIGIT: '',
    });
    expect(policy.minLength).toBe(12);
    expect(policy.requireSymbol).toBe(true);
    expect(policy.requireDigit).toBe(true);
  });
});

describe('password-expiration.helper', () => {
  const now = new Date('2026-01-01T00:00:00Z');

  it('calcula expiración o null si está deshabilitada', () => {
    expect(computePasswordExpiration(0, now)).toBeNull();
    expect(computePasswordExpiration(30, now)).toEqual(
      new Date('2026-01-31T00:00:00Z'),
    );
  });

  it('detecta expiración y días restantes', () => {
    expect(isPasswordExpired(null, now)).toBe(false);
    expect(isPasswordExpired(new Date('2025-12-31T00:00:00Z'), now)).toBe(true);
    expect(
      daysUntilPasswordExpiration(new Date('2026-01-11T00:00:00Z'), now),
    ).toBe(10);
    expect(
      daysUntilPasswordExpiration(new Date('2025-01-01T00:00:00Z'), now),
    ).toBe(0);
    expect(daysUntilPasswordExpiration(null, now)).toBeNull();
  });
});

describe('login-lockout.helper', () => {
  const now = new Date('2026-01-01T00:00:00Z');
  const options = { maxAttempts: 3, lockoutMinutes: 15 };

  it('incrementa intentos sin bloquear bajo el máximo', () => {
    expect(evaluateFailedAttempt(1, options, now)).toEqual({
      attempts: 2,
      lockedUntil: null,
      permanentBlock: false,
    });
  });

  it('bloquea temporalmente al alcanzar el máximo y reinicia intentos', () => {
    const decision = evaluateFailedAttempt(2, options, now);
    expect(decision.attempts).toBe(0);
    expect(decision.lockedUntil).toEqual(new Date('2026-01-01T00:15:00Z'));
    expect(decision.permanentBlock).toBe(false);
  });

  it('con lockoutMinutes=0 el bloqueo es permanente', () => {
    expect(
      evaluateFailedAttempt(2, { ...options, lockoutMinutes: 0 }, now)
        .permanentBlock,
    ).toBe(true);
  });

  it('isLockedOut / desbloqueo temporal al vencer', () => {
    const until = new Date('2026-01-01T00:15:00Z');
    expect(isLockedOut(until, now)).toBe(true);
    expect(isLockedOut(until, new Date('2026-01-01T00:15:01Z'))).toBe(false);
    expect(isLockedOut(null, now)).toBe(false);
    expect(remainingLockoutMinutes(until, now)).toBe(15);
  });
});
