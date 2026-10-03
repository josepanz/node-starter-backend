import { Logger } from '@nestjs/common';
import { PhoneHelper } from '@common/helpers/phone.helper';
import { SmsProviderError } from '../errors/sms.errors';
import type {
  ISmsMessage,
  ISmsSender,
  ISmsSendResult,
} from '../interfaces/sms-sender.interface';
import type { InfobipGateway } from './infobip.gateway';

/** Grupos de estado de Infobip que significan "el proveedor aceptó el SMS". */
const ACCEPTED_GROUPS: ReadonlySet<string> = new Set([
  'PENDING',
  'ACCEPTED',
  'DELIVERED',
]);

/** Adapter de `ISmsSender` sobre Infobip. */
export class InfobipSmsSender implements ISmsSender {
  readonly provider = 'INFOBIP';
  private readonly logger = new Logger(InfobipSmsSender.name);

  constructor(
    private readonly gateway: InfobipGateway,
    private readonly from?: string,
  ) {}

  async send(message: ISmsMessage): Promise<ISmsSendResult> {
    const response = await this.gateway.send({
      type: 'text',
      messages: [
        {
          destinations: [{ to: message.to }],
          text: message.text,
          ...(this.from ? { from: this.from } : {}),
        },
      ],
    });

    const sent = Array.isArray(response?.messages)
      ? response.messages[0]
      : undefined;
    if (!sent?.messageId || !sent.status?.groupName) {
      throw new SmsProviderError(
        'Respuesta de Infobip sin el formato esperado',
      );
    }
    if (!ACCEPTED_GROUPS.has(sent.status.groupName)) {
      throw new SmsProviderError(
        `Infobip rechazó el mensaje (${sent.status.groupName})`,
        sent.status.groupName,
      );
    }

    this.logger.log(
      `SMS aceptado messageId=${sent.messageId} estado=${sent.status.groupName} destino=${PhoneHelper.mask(message.to)}`,
    );
    return { messageId: sent.messageId, status: sent.status.groupName };
  }
}
