import { catchError, Observable } from 'rxjs';
import { AxiosError } from 'axios';
import { CustomHttpResponseHelper } from '@common/helpers/custom-http-response-helper.helper';
import { Logger } from '@nestjs/common';

interface ApiErrorResponse {
  message: string;
}

export function handleHttpErrors(contextMessage: string) {
  const originError = new Error();
  return <T>(source: Observable<T>): Observable<T> => {
    return source.pipe(
      catchError((error: AxiosError) => {
        const serverError = error as AxiosError<ApiErrorResponse>;
        const { serviceName, locationContext } = parseOriginStack(
          originError.stack,
        );
        const message = getMessageError(serverError?.response?.data);
        const logger = new Logger(serviceName);

        logger.error(
          `${contextMessage} [${locationContext}] | Status: ${error.response?.status} | URL: ${error.config?.url} | Message: ${message}`,
          originError.stack,
        );
        if (error.response) {
          CustomHttpResponseHelper.handleResponse(error.response);
        }

        CustomHttpResponseHelper.handleAxiosError(error);
      }),
    );
  };

  /**
   * Extrae de forma segura y ultra-defensiva el mensaje de error de una API externa.
   * Se usa 'unknown' para permitir validar tanto JSONs estructurados como strings/HTMLs crudos.
   */
  function getMessageError(responseData: unknown): string {
    let apiMessage = 'No Message';
    if (responseData !== undefined && responseData !== null) {
      if (typeof responseData === 'string') {
        // Caso A: El servidor devolvió texto plano (ej: HTML de Nginx o string crudo)
        apiMessage = responseData.trim();
      } else if (typeof responseData === 'object' && responseData !== null) {
        // Caso B: El servidor devolvió un objeto JSON
        const rawMessage =
          (responseData as any).message ?? (responseData as any).error;

        if (Array.isArray(rawMessage)) {
          // Si NestJS/Class-Validator devuelve un array de errores, tomamos el primero o los unimos
          apiMessage = rawMessage[0] || 'Empty error array';
        } else if (typeof rawMessage === 'string') {
          // Si es un string directo de toda la vida
          apiMessage = rawMessage;
        } else if (typeof rawMessage === 'object' && rawMessage !== null) {
          // Si viene un objeto anidado extraño, lo serializamos de forma segura
          apiMessage = JSON.stringify(rawMessage);
        }
      }
    }

    // 2. Limpieza de strings largos o saltos de línea (por si vino un HTML de Nginx/Cloudflare)
    return apiMessage.replace(/\n/g, ' ').substring(0, 500);
  }

  /**
   * Parsea el stack trace para aislar de forma precisa el nombre de la clase (Servicio)
   * y la ubicación exacta (archivo, línea y columna).
   */
  function parseOriginStack(stack?: string): {
    serviceName: string;
    locationContext: string;
  } {
    const fallback = {
      serviceName: 'HttpServiceBackend',
      locationContext: 'HttpOperation',
    };
    if (!stack) return fallback;

    const lines = stack.split('\n');
    // La línea [2] representa al Pipe/Service que ejecutó el helper
    const callerLine = lines[2] || '';

    // Expresión regular para capturar "at Clase.metodo (ruta/archivo.ts:linea:columna)"
    const match = callerLine.match(/at\s+([\w.]+)\s+\((.*)\)/);

    if (match && match[1]) {
      const fullMethod = match[1];
      const pathParts = match[2].split(/[\\/]/);
      const fileAndLine = pathParts[pathParts.length - 1];

      // Extraemos únicamente el nombre de la clase antes del punto
      const serviceName = fullMethod.split('.')[0] || fallback.serviceName;
      const methodName = fullMethod.split('.')[1] || 'method';

      return {
        serviceName,
        locationContext: `${methodName} -> ${fileAndLine}`,
      };
    }

    return fallback;
  }
}
