import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import { RecipientHelper } from '../helpers/recipient.helper';
import type {
  IEmailMessage,
  IEmailSender,
  IEmailSendResult,
} from '../interfaces/email-sender.interface';

/**
 * Fallback sin `EMAIL_HOST` (dev/CI): no envía, loguea destinatarios enmascarados y el asunto.
 * Nunca loguea el cuerpo (puede traer links con tokens).
 */
export class ConsoleEmailSender implements IEmailSender {
  readonly provider = 'CONSOLE';
  private readonly logger = new Logger(ConsoleEmailSender.name);

  send(message: IEmailMessage): Promise<IEmailSendResult> {
    const { to, cc, bcc } = RecipientHelper.normalize(message);
    const messageId = `console-${randomUUID()}`;
    this.logger.log(
      `[Email simulado] a=${RecipientHelper.maskAll({ to, cc, bcc })} asunto="${message.subject}" messageId=${messageId}`,
    );
    return Promise.resolve({
      messageId,
      accepted: [...to, ...(cc ?? []), ...(bcc ?? [])],
      rejected: [],
    });
  }

  isAvailable(): boolean {
    return true;
  }
}
