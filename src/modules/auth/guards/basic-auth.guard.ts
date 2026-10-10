import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiClientsDBService } from '@modules/api-clients-db/services/api-clients-db.service';
import type { ApiClientVerification } from '@modules/api-clients-db/interfaces/api-client.interface';
import { API_CLIENT_SCOPES } from '@modules/api-clients-db/constants/api-client-scopes.constants';
import { isIpAllowed } from '@common/helpers/ip.helper';
import { API_CLIENT_SCOPES_KEY } from '../decorators/api-client.decorators';
import type { ApiClientRequest } from '../interfaces/api-client-request.interface';

/**
 * Patrón: guard de autenticación M2M (Basic `clientId:secret`). Verifica el secret contra su hash
 * bcrypt (en `ApiClientsDBService`), aplica allowlist de IPs y, si el handler declara
 * `@ApiClientScopes(...)`, exige esos scopes. Publica la identidad en `request.apiClient`.
 * Los endpoints que solo necesitan "app cliente válida" (login, onboarding) no declaran scopes.
 */
@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly logger = new Logger(BasicAuthGuard.name);

  constructor(
    private readonly apiClients: ApiClientsDBService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ApiClientRequest>();
    const { clientId, secret } = this.parseBasicHeader(
      request.headers.authorization,
    );

    let verification: ApiClientVerification;
    try {
      verification = await this.apiClients.verifyCredentials(clientId, secret);
    } catch (error) {
      this.logger.error(
        'Error al validar credenciales de API',
        error instanceof Error ? error.stack : String(error),
      );
      throw new ForbiddenException(
        'Error de servicio al validar credenciales.',
      );
    }

    if (verification.result === 'invalid') {
      throw new UnauthorizedException('Credenciales inválidas.');
    }
    if (verification.result === 'inactive') {
      this.logger.warn(`Acceso denegado: cliente ${clientId} inactivo.`);
      throw new ForbiddenException(
        'El acceso para este cliente ha sido revocado.',
      );
    }

    const { principal } = verification;
    if (!isIpAllowed(request.ip, principal.allowedIps)) {
      this.logger.warn(`Acceso denegado: IP no permitida para ${clientId}.`);
      throw new ForbiddenException('IP no autorizada para este cliente.');
    }

    const required =
      this.reflector.getAllAndOverride<string[] | undefined>(
        API_CLIENT_SCOPES_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? [];
    const granted = principal.scopes;
    const hasScopes =
      granted.includes(API_CLIENT_SCOPES.ALL) ||
      required.every((scope) => granted.includes(scope));
    if (!hasScopes) {
      throw new ForbiddenException('Scope insuficiente para este recurso.');
    }

    request.apiClient = principal;
    return true;
  }

  private parseBasicHeader(header: string | undefined): {
    clientId: string;
    secret: string;
  } {
    if (!header?.startsWith('Basic ')) {
      throw new UnauthorizedException('Se requiere Basic Authentication.');
    }
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    // El secret puede contener ':'; solo el primero separa clientId de secret.
    const separator = decoded.indexOf(':');
    if (separator <= 0 || separator === decoded.length - 1) {
      throw new UnauthorizedException(
        'Formato de credenciales Basic Auth incorrecto (debe ser client_id:client_secret).',
      );
    }
    return {
      clientId: decoded.slice(0, separator),
      secret: decoded.slice(separator + 1),
    };
  }
}
