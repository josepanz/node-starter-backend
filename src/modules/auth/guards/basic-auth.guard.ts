import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { ApiClientCredential } from '@prisma/client';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly logger = new Logger(BasicAuthGuard.name);

  constructor(private readonly prisma: PrismaDatasource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Se requiere Basic Authentication.');
    }

    const encodedCredentials = authHeader.substring(6);
    let decodedString: string;

    try {
      decodedString = Buffer.from(encodedCredentials, 'base64').toString(
        'utf8',
      );
    } catch (error) {
      this.logger.error(
        `Error de decodificación Base64 en Basic Auth. ${error}`,
      );
      throw new UnauthorizedException('Formato de credenciales inválido.');
    }

    const credentials = decodedString.split(':');
    if (credentials.length !== 2) {
      throw new UnauthorizedException(
        'Formato de credenciales Basic Auth incorrecto (debe ser client_id:client_secret).',
      );
    }

    const [clientId, clientSecret] = credentials;

    let apiClientCredential: ApiClientCredential;
    try {
      apiClientCredential =
        (await this.prisma.extended.apiClientCredential.findUnique({
          where: { clientId: clientId },
        })) as unknown as ApiClientCredential;
    } catch (error) {
      this.logger.error(
        'Error de base de datos al buscar credenciales:',
        error.stack,
      );
      throw new ForbiddenException(
        'Error de servicio al validar credenciales.',
      );
    }

    if (!apiClientCredential) {
      throw new UnauthorizedException('Client ID incorrecto.');
    }

    if (!apiClientCredential.isActive) {
      this.logger.warn(`Acceso denegado: Cliente ${clientId} inactivo.`);
      throw new ForbiddenException(
        `El acceso para este cliente ha sido revocado.`,
      );
    }

    const isPasswordValid = clientSecret === apiClientCredential.secretKey;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Secreto incorrecto.');
    }

    request.apiClient = {
      id: apiClientCredential.clientId,
      name: apiClientCredential.clientName,
    };

    return true;
  }
}
