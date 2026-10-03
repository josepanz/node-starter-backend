/**
 * Patrón: ventana deslizante en memoria por socket (KISS). Un socket vive en una sola instancia,
 * por lo que no necesita store compartido: se limpia al desconectar. Protege canales de alta
 * frecuencia (p. ej. presence/location) sin pasar por el ThrottlerGuard HTTP.
 */
export class SocketThrottle {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** `true` si el mensaje entra en el cupo; `false` si el socket excedió el límite. */
  consume(socketId: string, now: number = Date.now()): boolean {
    const recent = (this.hits.get(socketId) ?? []).filter(
      (at) => now - at < this.windowMs,
    );
    if (recent.length >= this.limit) {
      this.hits.set(socketId, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(socketId, recent);
    return true;
  }

  release(socketId: string): void {
    this.hits.delete(socketId);
  }
}
