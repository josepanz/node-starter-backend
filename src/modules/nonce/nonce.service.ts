import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { INonceStore, NONCE_STORE } from './nonce.interfaces';

const NONCE_RANDOM_BYTES = 16;
const NONCE_FORMAT = /^[A-Za-z0-9._:-]{8,128}$/;

/**
 * Servicio de nonces anti-replay / tokens de un solo uso. Delega el almacenamiento en
 * `INonceStore` (DIP): el servicio no sabe si hay Redis o memoria.
 */
@Injectable()
export class NonceService {
  private readonly logger = new Logger(NonceService.name);

  constructor(
    @Inject(NONCE_STORE) private readonly store: INonceStore,
    @Inject(APP_CONFIG.KEY) private readonly config: ConfigType<AppConfigType>,
  ) {}

  get ttlSeconds(): number {
    return this.config.nonce.ttlSeconds;
  }

  /** Emite un nonce aleatorio (32 hex) válido por `NONCE_TTL_SECONDS`. */
  async issue(): Promise<string> {
    const nonce = randomBytes(NONCE_RANDOM_BYTES).toString('hex');
    await this.guarded(() => this.store.issue(nonce, this.ttlSeconds));
    return nonce;
  }

  /** Consume un nonce emitido: `true` una sola vez, `false` si no existe/expiró/ya se usó. */
  async consume(nonce: string | undefined): Promise<boolean> {
    if (!nonce || typeof nonce !== 'string') return false;
    return await this.guarded(() => this.store.consume(nonce));
  }

  /**
   * Registra un nonce elegido por el cliente (p. ej. `X-Nonce` de un request firmado).
   * `false` si ya fue visto (replay) o tiene formato inválido.
   */
  async claim(
    nonce: string | undefined,
    ttlSeconds?: number,
  ): Promise<boolean> {
    if (!nonce || !NONCE_FORMAT.test(nonce)) return false;
    return await this.guarded(() =>
      this.store.claim(nonce, ttlSeconds ?? this.ttlSeconds),
    );
  }

  /** Falla cerrado: si el store (Redis) no responde, 503 en vez de aceptar sin validar. */
  private async guarded<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(
        `Store de nonces no disponible: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new ServiceUnavailableException(
        'Servicio de nonces no disponible.',
      );
    }
  }
}
