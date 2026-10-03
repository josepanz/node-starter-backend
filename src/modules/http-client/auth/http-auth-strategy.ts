import type { AxiosRequestConfig } from 'axios';

/**
 * Patrón: Strategy. Cada esquema de autenticación saliente es intercambiable y el cliente
 * base no conoce ninguno en particular (Open/Closed): agregar HMAC/OAuth2 = nueva clase.
 */
export interface HttpAuthStrategy {
  apply(config: AxiosRequestConfig): Promise<AxiosRequestConfig>;
}

export type HttpAuthType = 'none' | 'basic' | 'api-key' | 'bearer';

export interface HttpAuthSettings {
  type: HttpAuthType;
  user?: string;
  secret?: string;
  headerName?: string;
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
 * Factory: arma la strategy desde config. Si faltan credenciales cae a `none` (fallback
 * sin crash: el upstream responderá 401 y quedará logueado).
 */
export function createAuthStrategy(
  settings: HttpAuthSettings,
): HttpAuthStrategy {
  const { type, user = '', secret = '', headerName = 'X-Api-Key' } = settings;

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
    default:
      return new NoAuthStrategy();
  }
}
