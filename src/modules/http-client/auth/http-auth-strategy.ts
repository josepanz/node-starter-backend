import axios, { type AxiosRequestConfig } from 'axios';
import { randomUUID } from 'crypto';
import {
  SIGNATURE_HEADERS,
  signRequest,
} from '@common/helpers/crypto/request-signature.helper';

/**
 * Patrón: Strategy. Cada esquema de autenticación saliente es intercambiable y el cliente
 * base no conoce ninguno en particular (Open/Closed): agregar HMAC/OAuth2 = nueva clase.
 */
export interface HttpAuthStrategy {
  apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig>;
}

export type HttpAuthType = 'none' | 'basic' | 'api-key' | 'bearer' | 'hmac';

export interface HttpAuthSettings {
  type: HttpAuthType;
  user?: string;
  secret?: string;
  headerName?: string;
  /** Secreto de firma HMAC (type `hmac`). `user`+`secret` agregan además Basic Auth. */
  signingSecret?: string;
}

const withHeader = (
  config: AxiosRequestConfig,
  name: string,
  value: string,
): AxiosRequestConfig => ({
  ...config,
  headers: { ...(config.headers ?? {}), [name]: value },
});

export class NoAuthStrategy implements HttpAuthStrategy {
  apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    return Promise.resolve(config);
  }
}

export class BasicAuthStrategy implements HttpAuthStrategy {
  constructor(
    private readonly user: string,
    private readonly password: string,
  ) {}

  apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const token = Buffer.from(`${this.user}:${this.password}`).toString(
      'base64',
    );
    return Promise.resolve(
      withHeader(config, 'Authorization', `Basic ${token}`),
    );
  }
}

export class ApiKeyHeaderStrategy implements HttpAuthStrategy {
  constructor(
    private readonly headerName: string,
    private readonly apiKey: string,
  ) {}

  apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    return Promise.resolve(withHeader(config, this.headerName, this.apiKey));
  }
}

/** Token fijo o proveedor async (p. ej. cache de un token OAuth2 renovable). */
export class BearerAuthStrategy implements HttpAuthStrategy {
  constructor(private readonly token: string | (() => Promise<string>)) {}

  async apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const token =
      typeof this.token === 'function' ? await this.token() : this.token;
    return withHeader(config, 'Authorization', `Bearer ${token}`);
  }
}

/**
 * Firma HMAC-SHA256 del request (`X-Signature`, `X-Timestamp`, opcional `X-Nonce`), con el mismo
 * protocolo que valida `HmacSignatureGuard`. Serializa el body a string ANTES de firmar y lo
 * envía tal cual (axios no lo reserializa), de modo que los bytes firmados == bytes enviados.
 */
export class HmacAuthStrategy implements HttpAuthStrategy {
  constructor(
    private readonly signingSecret: string,
    private readonly options: { nonce?: boolean; now?: () => number } = {},
  ) {}

  apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    const body = HmacAuthStrategy.serializeBody(config.data);
    const timestamp = String(
      Math.floor((this.options.now?.() ?? Date.now()) / 1000),
    );
    const nonce = this.options.nonce ? randomUUID() : undefined;
    const uri = new URL(
      axios.getUri({ ...config, url: config.url ?? '/' }),
      'http://signing.local',
    );

    const signature = signRequest(this.signingSecret, {
      method: config.method ?? 'GET',
      path: `${uri.pathname}${uri.search}`,
      timestamp,
      body,
      nonce,
    });

    const headers: Record<string, string> = {
      ...(config.headers as Record<string, string> | undefined),
      [SIGNATURE_HEADERS.signature]: signature,
      [SIGNATURE_HEADERS.timestamp]: timestamp,
      ...(nonce ? { [SIGNATURE_HEADERS.nonce]: nonce } : {}),
      ...(body !== undefined && typeof config.data === 'object'
        ? { 'Content-Type': 'application/json' }
        : {}),
    };
    return Promise.resolve({
      ...config,
      data: body ?? config.data,
      headers,
    });
  }

  private static serializeBody(data: unknown): string | undefined {
    if (data === undefined || data === null) return undefined;
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }
}

/** Aplica varias strategies en orden (p. ej. Basic para identificar + HMAC para firmar). */
export class CompositeAuthStrategy implements HttpAuthStrategy {
  constructor(private readonly strategies: HttpAuthStrategy[]) {}

  async apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    let current = config;
    for (const strategy of this.strategies) {
      current = await strategy.apply(current);
    }
    return current;
  }
}

/**
 * Factory: arma la strategy desde config. Si faltan credenciales cae a `none` (fallback
 * sin crash: el upstream responderá 401 y quedará logueado).
 */
export function createAuthStrategy(
  settings: HttpAuthSettings,
): HttpAuthStrategy {
  const {
    type,
    user = '',
    secret = '',
    headerName = 'X-Api-Key',
    signingSecret = '',
  } = settings;

  switch (type) {
    case 'basic':
      return user && secret
        ? new BasicAuthStrategy(user, secret)
        : new NoAuthStrategy();
    case 'api-key':
      return secret
        ? new ApiKeyHeaderStrategy(headerName, secret)
        : new NoAuthStrategy();
    case 'bearer':
      return secret ? new BearerAuthStrategy(secret) : new NoAuthStrategy();
    case 'hmac': {
      if (!signingSecret) return new NoAuthStrategy();
      const hmac = new HmacAuthStrategy(signingSecret);
      return user && secret
        ? new CompositeAuthStrategy([new BasicAuthStrategy(user, secret), hmac])
        : hmac;
    }
    default:
      return new NoAuthStrategy();
  }
}
