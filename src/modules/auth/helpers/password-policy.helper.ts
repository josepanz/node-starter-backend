/**
 * Patrón: política como dato + función pura (SRP/KISS). La política es configurable por env
 * y la validación no tiene dependencias, así sirve igual para el servicio, para un
 * validador de class-validator y para tests.
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSymbol: boolean;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  maxLength: 72, // bcrypt trunca silenciosamente más allá de 72 bytes
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: false,
};

export interface PasswordPolicyResult {
  valid: boolean;
  violations: string[];
}

export function validatePasswordPolicy(
  password: string,
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
): PasswordPolicyResult {
  const violations: string[] = [];

  if (password.length < policy.minLength) {
    violations.push(`debe tener al menos ${policy.minLength} caracteres`);
  }
  if (password.length > policy.maxLength) {
    violations.push(`no debe superar los ${policy.maxLength} caracteres`);
  }
  if (policy.requireUppercase && !/\p{Lu}/u.test(password)) {
    violations.push('debe incluir una mayúscula');
  }
  if (policy.requireLowercase && !/\p{Ll}/u.test(password)) {
    violations.push('debe incluir una minúscula');
  }
  if (policy.requireDigit && !/\d/.test(password)) {
    violations.push('debe incluir un dígito');
  }
  if (policy.requireSymbol && !/[^\p{L}\p{N}\s]/u.test(password)) {
    violations.push('debe incluir un símbolo');
  }

  return { valid: violations.length === 0, violations };
}

/** Lee la política desde variables de entorno (misma fuente que `APP_CONFIG`). */
export function passwordPolicyFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): PasswordPolicy {
  const num = (v: string | undefined, d: number) =>
    v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d;
  const bool = (v: string | undefined, d: boolean) =>
    v === undefined || v === '' ? d : v === 'true';
  const d = DEFAULT_PASSWORD_POLICY;

  return {
    minLength: num(env.PASSWORD_MIN_LENGTH, d.minLength),
    maxLength: num(env.PASSWORD_MAX_LENGTH, d.maxLength),
    requireUppercase: bool(env.PASSWORD_REQUIRE_UPPERCASE, d.requireUppercase),
    requireLowercase: bool(env.PASSWORD_REQUIRE_LOWERCASE, d.requireLowercase),
    requireDigit: bool(env.PASSWORD_REQUIRE_DIGIT, d.requireDigit),
    requireSymbol: bool(env.PASSWORD_REQUIRE_SYMBOL, d.requireSymbol),
  };
}
