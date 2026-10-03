/**
 * Patrón: decisión de lockout como función pura (separa la regla del I/O). El servicio solo
 * persiste el resultado. `lockoutMinutes = 0` => bloqueo permanente (el caller marca el
 * usuario como BLOCKED); `> 0` => bloqueo temporal hasta `lockedUntil`.
 */
export interface LockoutOptions {
  maxAttempts: number;
  lockoutMinutes: number;
}

export interface FailedAttemptDecision {
  attempts: number;
  lockedUntil: Date | null;
  permanentBlock: boolean;
}

export function evaluateFailedAttempt(
  currentAttempts: number,
  options: LockoutOptions,
  now: Date = new Date(),
): FailedAttemptDecision {
  const attempts = currentAttempts + 1;

  if (attempts < options.maxAttempts) {
    return { attempts, lockedUntil: null, permanentBlock: false };
  }
  if (options.lockoutMinutes <= 0) {
    return { attempts, lockedUntil: null, permanentBlock: true };
  }
  return {
    // Al bloquear se reinician los intentos: tras el desbloqueo hay una ventana nueva.
    attempts: 0,
    lockedUntil: new Date(now.getTime() + options.lockoutMinutes * 60_000),
    permanentBlock: false,
  };
}

export function isLockedOut(
  lockedUntil: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  return !!lockedUntil && lockedUntil.getTime() > now.getTime();
}

export function remainingLockoutMinutes(
  lockedUntil: Date,
  now: Date = new Date(),
): number {
  return Math.max(
    1,
    Math.ceil((lockedUntil.getTime() - now.getTime()) / 60_000),
  );
}
