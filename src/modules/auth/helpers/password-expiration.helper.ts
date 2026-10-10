const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Patrón: helpers puros de fecha (inyectan `now` para ser deterministas en tests).
 * `expirationDays <= 0` significa "las contraseñas no expiran".
 */
export function computePasswordExpiration(
  expirationDays: number,
  from: Date = new Date(),
): Date | null {
  return expirationDays > 0
    ? new Date(from.getTime() + expirationDays * DAY_MS)
    : null;
}

export function isPasswordExpired(
  expiredAt: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  return !!expiredAt && expiredAt.getTime() <= now.getTime();
}

/** Días enteros restantes (0 si ya expiró, `null` si no expira). */
export function daysUntilPasswordExpiration(
  expiredAt: Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!expiredAt) return null;
  return Math.max(0, Math.ceil((expiredAt.getTime() - now.getTime()) / DAY_MS));
}
