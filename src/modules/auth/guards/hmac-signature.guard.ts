import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ApiClientsDBService } from '@modules/api-clients-db/services/api-clients-db.service';
import { NonceService } from '@modules/nonce/nonce.service';
import {
  isTimestampInWindow,
  SIGNATURE_HEADERS,
  verifyRequestSignature,
} from '@common/helpers/crypto/request-signature.helper';
import type { ApiClientRequest } from '../interfaces/api-client-request.interface';

const headerValue = (
  value: string | string[] | undefined,
): string | undefined => (Array.isArray(value) ? value[0] : value);

/**
 * Patrón: guard de integridad + anti-replay, opcional por cliente. Corre DESPUÉS de
 * `BasicAuthGuard` (necesita `request.apiClient`) y solo actúa si la credencial tiene
 * `hmacEnabled`. Valida `X-Signature` sobre `METHOD\npath\ntimestamp\nsha256(body)` usando el
 * rawBody de Nest (el body parseado no sirve: reserializar altera los bytes), el
 * `X-Timestamp` dentro de la ventana configurable y, si viene, `X-Nonce` de un solo uso.
 * La firma se valida ANTES de consumir el nonce para que un tercero sin secreto no pueda
 * "quemar" nonces ajenos.
 */
@Injectable()
export class HmacSignatureGuard implements CanActivate {
  private readonly logger = new Logger(HmacSignatureGuard.name);

  constructor(
    private readonly apiClients: ApiClientsDBService,
    private readonly nonces: NonceService,
    @Inject(APP_CONFIG.KEY) private readonly config: ConfigType<AppConfigType>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiClientRequest>();
    const principal = request.apiClient;
    if (!principal) {
      throw new UnauthorizedException(
        'Se requiere autenticación de cliente antes de validar la firma.',
      );
    }
    if (!principal.hmacEnabled) return true;

    const signature = headerValue(request.headers[SIGNATURE_HEADERS.signature]);
    const timestamp = headerValue(request.headers[SIGNATURE_HEADERS.timestamp]);
    const nonce = headerValue(request.headers[SIGNATURE_HEADERS.nonce]);
    if (!signature || !timestamp) {
      throw new UnauthorizedException('Faltan X-Signature o X-Timestamp.');
    }

    const { hmacTimestampWindowSeconds: windowSeconds, hmacNonceRequired } =
      this.config.apiClients;
    if (!isTimestampInWindow(timestamp, windowSeconds)) {
      throw new UnauthorizedException(
        'X-Timestamp fuera de la ventana permitida.',
      );
    }
    if (hmacNonceRequired && !nonce) {
      throw new UnauthorizedException('Falta X-Nonce.');
    }

    const secret = await this.apiClients.getSigningSecret(principal.id);
    if (!secret) {
      this.logger.error(
        `Cliente ${principal.id} con HMAC activo pero sin signing secret.`,
      );
      throw new UnauthorizedException('Firma inválida.');
    }

    if (!request.rawBody && this.hasBody(request)) {
      throw new InternalServerErrorException(
        'rawBody no disponible: habilitar `rawBody: true` en NestFactory.create.',
      );
    }

    const valid = verifyRequestSignature(
      secret,
      {
        method: request.method,
        path: request.originalUrl,
        timestamp,
        body: request.rawBody,
        nonce,
      },
      signature,
    );
    if (!valid) {
      this.logger.warn(`Firma inválida para el cliente ${principal.id}.`);
      throw new UnauthorizedException('Firma inválida.');
    }

    if (nonce && !(await this.nonces.claim(nonce, windowSeconds * 2))) {
      throw new UnauthorizedException('Nonce inválido o ya utilizado.');
    }
    return true;
  }

  private hasBody(request: ApiClientRequest): boolean {
    const body: unknown = request.body;
    return (
      typeof body === 'object' &&
      body !== null &&
      Object.keys(body as Record<string, unknown>).length > 0
    );
  }
}
