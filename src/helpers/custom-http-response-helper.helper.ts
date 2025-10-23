import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';

export class CustomHttpResponseHelper {
  private static logger = new Logger(CustomHttpResponseHelper.name);

  static handleResponse(response: AxiosResponse): never {
    const status = response.status as HttpStatus;
    const statusText = response.statusText;

    switch (status) {
      case HttpStatus.NOT_FOUND:
        this.logger.warn(
          `No se encontraron datos para los parámetros proporcionados: ${status} - ${statusText}`,
        );
        throw new NotFoundException(
          'No se encontraron datos para los parámetros proporcionados.',
        );

      case HttpStatus.BAD_REQUEST:
        this.logger.warn(
          `Solicitud mal formada, verifique los datos y/o parámetros enviados: ${status} - ${statusText}`,
        );
        throw new BadRequestException(
          'Solicitud mal formada, verifique los datos y/o parámetros enviados.',
        );

      case HttpStatus.UNAUTHORIZED:
        this.logger.warn(`Credenciales inválidas: ${status} - ${statusText}`);
        throw new UnauthorizedException('Credenciales inválidas.');

      case HttpStatus.FORBIDDEN:
        this.logger.warn(`Usuario bloqueado: ${status} - ${statusText}`);
        throw new ForbiddenException('Usuario bloqueado.');

      case HttpStatus.INTERNAL_SERVER_ERROR:
        this.logger.warn(
          `Error interno del servidor al procesar la solicitud: ${status} - ${statusText}`,
        );
        throw new InternalServerErrorException(
          'Error interno del servidor al procesar la solicitud.',
        );

      default:
        this.logger.error(
          `Error inesperado en la respuesta HTTP: ${status} - ${statusText}`,
        );
        throw new HttpException(
          `Error inesperado en la respuesta: ${statusText}`,
          status,
        );
    }
  }

  /**
   * Manejo de errores de red / axios (cuando axios lanza excepción).
   */
  static handleAxiosError(error: AxiosError): never {
    if (error.response) {
      // Hubo respuesta con status != 2xx → lo manejamos con handleResponse
      this.handleResponse(error.response);
    }

    if (error.code === 'ECONNABORTED') {
      this.logger.error('Timeout al conectar con el servidor externo.');
      throw new GatewayTimeoutException(
        'El servidor externo no respondió a tiempo.',
      );
    }

    if (error.code === 'ECONNREFUSED') {
      this.logger.error('Conexión rechazada por el servidor externo.');
      throw new ServiceUnavailableException(
        'Conexión rechazada por el servidor externo.',
      );
    }

    if (error.code === 'ENOTFOUND') {
      this.logger.error('Servidor externo no encontrado.');
      throw new BadGatewayException('Servidor externo no encontrado.');
    }

    this.logger.error(`Error desconocido de Axios: ${error.message}`);
    throw new InternalServerErrorException(
      'Error desconocido al procesar la solicitud.',
    );
  }
}
