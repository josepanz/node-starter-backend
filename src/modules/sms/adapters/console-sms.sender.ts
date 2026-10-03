import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { PhoneHelper } from '@common/helpers/phone.helper';
import type {
  ISmsMessage,
  ISmsSender,
  ISmsSendResult,
} from '../interfaces/sms-sender.interface';

/**
 * Fallback sin credenciales (dev/CI): no envía nada, solo loguea con el destino enmascarado y sin
 * el texto. Devuelve un id sintético y estado ACCEPTED para que el flujo completo sea probable.
 */
export class ConsoleSmsSender implements ISmsSender {
  readonly provider = 'CONSOLE';
  private readonly logger = new Logger(ConsoleSmsSender.name);

  send(message: ISmsMessage): Promise<ISmsSendResult> {
    const messageId = `console-${randomUUID()}`;
    this.logger.log(
      `[SMS simulado] destino=${PhoneHelper.mask(message.to)} caracteres=${message.text.length} messageId=${messageId}`,
    );
    return Promise.resolve({ messageId, status: 'ACCEPTED' });
  }
}
