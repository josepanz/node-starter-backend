/**
 * Patrón: clasificador puro (SRP/KISS). Distingue fallas transitorias de conectividad
 * (reintentables / 503) de bugs reales de aplicación, para que filtros, retries y health
 * checks compartan una única lista de códigos y mensajes conocidos (DRY).
 */
const TRANSIENT_CODES: ReadonlySet<string> = new Set([
  // Node / red
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EPIPE',
  // PostgreSQL: too_many_connections, cannot_connect_now (arrancando/apagando)
  '53300',
  '57P03',
  // Prisma: no se alcanza la DB (P1001), timeout de DB (P1002/P1008),
  // conexión cerrada (P1017), timeout del pool de conexiones (P2024)
  'P1001',
  'P1002',
  'P1008',
  'P1017',
  'P2024',
]);

const TRANSIENT_MESSAGE_PATTERNS: readonly string[] = [
  'timeout exceeded when trying to connect',
  'connection terminated due to connection timeout',
  'connection terminated unexpectedly',
  'timed out fetching a new connection from the connection pool',
  'remaining connection slots are reserved',
];

function readStringProp(source: unknown, prop: string): string | undefined {
  if (typeof source !== 'object' || source === null) return undefined;
  const value = (source as Record<string, unknown>)[prop];
  return typeof value === 'string' ? value : undefined;
}

export class TransientConnectionErrorHelper {
  /**
   * @param error Error de forma desconocida (pg, Prisma, axios, red)
   * @returns `true` si matchea un código/mensaje transitorio conocido (también mira `cause`)
   */
  static isTransient(error: unknown, depth = 0): boolean {
    if (error === null || error === undefined || depth > 2) return false;

    const codes = [
      readStringProp(error, 'code'),
      readStringProp(error, 'errorCode'),
    ];
    if (codes.some((code) => code !== undefined && TRANSIENT_CODES.has(code))) {
      return true;
    }

    const message = (
      error instanceof Error
        ? error.message
        : (readStringProp(error, 'message') ?? '')
    ).toLowerCase();
    if (TRANSIENT_MESSAGE_PATTERNS.some((p) => message.includes(p))) {
      return true;
    }

    const cause =
      typeof error === 'object'
        ? (error as { cause?: unknown }).cause
        : undefined;
    return cause !== undefined && this.isTransient(cause, depth + 1);
  }
}
