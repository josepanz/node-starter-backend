import type { IInfobipAxiosError } from '../interfaces/infobip.interface';

const SERVER_ERROR_MIN_STATUS = 500;
const RATE_LIMIT_STATUS = 429;

/** Reconoce y describe los errores de axios que el SDK de Infobip entrega como valor resuelto. */
export class InfobipErrorHelper {
  static isAxiosError(value: unknown): value is IInfobipAxiosError {
    return (
      value instanceof Error &&
      (value as { isAxiosError?: unknown }).isAxiosError === true
    );
  }

  /** Transitorio: sin respuesta (red), 5xx o 429. El resto (4xx) es un rechazo. */
  static isUnavailable(error: IInfobipAxiosError): boolean {
    const status = error.response?.status;
    if (!error.response || status === undefined) return true;
    return status >= SERVER_ERROR_MIN_STATUS || status === RATE_LIMIT_STATUS;
  }

  /** Detalle loguable: status, código de red y texto del servicio; sin body ni credenciales. */
  static describe(error: IInfobipAxiosError): string {
    const text = error.response?.data?.requestError?.serviceException?.text;
    const parts = [
      error.response?.status !== undefined
        ? `status ${error.response.status}`
        : undefined,
      error.code ? `code ${error.code}` : undefined,
      text ? `serviceException ${text}` : undefined,
    ].filter((part): part is string => part !== undefined);

    return parts.length > 0
      ? `${error.message} (${parts.join(', ')})`
      : error.message;
  }
}
