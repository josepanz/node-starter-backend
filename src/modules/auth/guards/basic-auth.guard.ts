import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaDatasource } from '@core/database/prisma.service';
import { ApiClientCredential } from '@prisma/client';

/**
 * export class BasicAuthGuard implements CanActivate {
 * implementa la autenticación HTTP Basic (client_id:client_secret)
 * validando las credenciales contra la base de datos.
 * * * Espera el encabezado: Authorization: Basic <base64(client_id:client_secret)>
 */
@Injectable()
export class BasicAuthGuard implements CanActivate {
  private readonly logger = new Logger(BasicAuthGuard.name);

  // Inyectamos el servicio de base de datos (Prisma)
  constructor(private readonly prisma: PrismaDatasource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // 1. Validar el formato de Basic Auth
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException('Se requiere Basic Authentication.');
    }

    const encodedCredentials = authHeader.substring(6);
    let decodedString: string;

    try {
      // 2. Decodificar Base64
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

    // 3. Buscar el cliente por ID
    let apiClientCredential: ApiClientCredential;
    try {
      apiClientCredential = (await this.prisma.apiClientCredential.findUnique({
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

    // 4. Verificar si el cliente existe
    if (!apiClientCredential) {
      throw new UnauthorizedException('Client ID incorrecto.');
    }

    // 5. Verificar si la cuenta está activa (por si se revoca el acceso)
    if (!apiClientCredential.isActive) {
      this.logger.warn(`Acceso denegado: Cliente ${clientId} inactivo.`);
      throw new ForbiddenException(
        `El acceso para este cliente ha sido revocado.`,
      );
    }

    // 6. Comparar el secreto
    const isPasswordValid = clientSecret === apiClientCredential.secretKey;

    if (!isPasswordValid) {
      // Usamos el mismo mensaje para no dar pistas sobre si falló el ID o el secreto
      throw new UnauthorizedException('Secreto incorrecto.');
    }

    // Opcional: Adjuntar el objeto del cliente a la request para usarlo en el controlador
    request.apiClient = {
      id: apiClientCredential.clientId,
      name: apiClientCredential.clientName,
    };

    return true; // Autenticación exitosa
  }
}
