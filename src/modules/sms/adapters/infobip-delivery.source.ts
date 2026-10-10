import type {
  IDeliveryReport,
  IDeliveryStatusSource,
} from '../interfaces/delivery-status-source.interface';
import type { IInfobipMessageLog } from '../interfaces/infobip.interface';
import type { InfobipGateway } from './infobip.gateway';

const toReport = (log: IInfobipMessageLog): IDeliveryReport => ({
  messageId: log.messageId,
  providerStatus: log.status.groupName,
  errorDescription: log.error?.description,
});

/**
 * `reports`: lee `/sms/1/reports`. Cada reporte se entrega UNA vez (leerlo lo consume), por eso
 * solo es seguro si la cuenta no la comparten otros servicios.
 */
export class InfobipReportsSource implements IDeliveryStatusSource {
  constructor(
    private readonly gateway: InfobipGateway,
    private readonly limit: number,
  ) {}

  async fetchReports(): Promise<IDeliveryReport[]> {
    return (await this.gateway.getReports(this.limit)).map(toReport);
  }
}

/** `logs`: consulta `/sms/1/logs` por messageId; no consume nada, es seguro en cuentas compartidas. */
export class InfobipLogsSource implements IDeliveryStatusSource {
  constructor(private readonly gateway: InfobipGateway) {}

  async fetchReports(pendingMessageIds: string[]): Promise<IDeliveryReport[]> {
    return (await this.gateway.getLogs(pendingMessageIds)).map(toReport);
  }
}
