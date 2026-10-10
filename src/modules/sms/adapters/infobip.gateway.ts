import { Logger } from '@nestjs/common';
import { AuthType, Infobip } from '@infobip-api/sdk';
import { PhoneHelper } from '@common/helpers/phone.helper';
import { TransientConnectionErrorHelper } from '@common/helpers/transient-connection-error.helper';
import { SmsProviderError, SmsUnavailableError } from '../errors/sms.errors';
import { InfobipErrorHelper } from '../helpers/infobip-error.helper';
import type {
  IInfobipClient,
  IInfobipHttpResponse,
  IInfobipMessageLog,
  IInfobipSendPayload,
  IInfobipSendResponse,
} from '../interfaces/infobip.interface';

export interface IInfobipGatewayOptions {
  baseUrl: string;
  apiKey: string;
  timeoutMs: number;
}

const TIMEOUT_MESSAGE = 'Infobip timeout';

/**
 * Patrón: Gateway/Facade sobre el SDK. Concentra lo propio del proveedor (timeout, errores
 * devueltos COMO VALOR por el SDK, clasificación transitorio vs rechazo) para que el sender y la
 * fuente de entrega compartan el cliente y la traducción a errores de dominio (DRY).
 */
export class InfobipGateway {
  private readonly logger = new Logger(InfobipGateway.name);
  private readonly client: IInfobipClient;

  constructor(private readonly options: IInfobipGatewayOptions) {
    this.client = new Infobip({
      baseUrl: options.baseUrl,
      apiKey: options.apiKey,
      authType: AuthType.ApiKey,
    }) as unknown as IInfobipClient;
  }

  async send(payload: IInfobipSendPayload): Promise<IInfobipSendResponse> {
    return await this.call(
      () => this.client.channels.sms.send(payload),
      'Error al enviar el SMS',
    );
  }

  async getReports(limit: number): Promise<IInfobipMessageLog[]> {
    const body = await this.call(
      () => this.client.channels.sms.reports.get({ limit }),
      'Error al consultar los reportes de entrega',
    );
    return this.results(body);
  }

  /** `GET /sms/1/logs` va de a un messageId (axios serializa arrays como `messageId[]=`). */
  async getLogs(messageIds: string[]): Promise<IInfobipMessageLog[]> {
    const logs: IInfobipMessageLog[] = [];
    for (const messageId of messageIds) {
      const body = await this.call(
        () => this.client.channels.sms.logs.get({ messageId }),
        'Error al consultar el log de mensajes',
      );
      logs.push(...this.results(body));
    }
    return logs;
  }

  private results(body: { results?: IInfobipMessageLog[] } | undefined) {
    if (!Array.isArray(body?.results)) {
      throw new SmsProviderError(
        'Respuesta de Infobip sin el formato esperado',
      );
    }
    return body.results;
  }

  private async call<T>(
    operation: () => Promise<IInfobipHttpResponse<T>>,
    context: string,
  ): Promise<T> {
    try {
      const response = await this.withTimeout(operation());
      return response?.data;
    } catch (error) {
      throw this.classify(error, context);
    }
  }

  /** El SDK resuelve con un `Error` en vez de rechazar: se re-lanza para clasificarlo. */
  private async withTimeout<T>(operation: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try {
      const result = await Promise.race([
        operation,
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(
            () => reject(new Error(TIMEOUT_MESSAGE)),
            this.options.timeoutMs,
          );
        }),
      ]);
      if (result instanceof Error) throw result;
      return result;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  private classify(
    error: unknown,
    context: string,
  ): SmsProviderError | SmsUnavailableError {
    if (error instanceof SmsProviderError) return error;

    const axiosError = InfobipErrorHelper.isAxiosError(error);
    const detail = axiosError
      ? InfobipErrorHelper.describe(error)
      : error instanceof Error
        ? error.message
        : String(error);
    this.logger.error(`${context} | ${PhoneHelper.maskPhonesInText(detail)}`);

    const transient =
      detail === TIMEOUT_MESSAGE ||
      TransientConnectionErrorHelper.isTransient(error) ||
      (axiosError && InfobipErrorHelper.isUnavailable(error));

    return transient
      ? new SmsUnavailableError('El proveedor de SMS no está disponible')
      : new SmsProviderError('El proveedor de SMS rechazó la operación');
  }
}
