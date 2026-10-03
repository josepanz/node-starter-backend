import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Message } from '@prisma/client';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import {
  ProviderRejectedError,
  ProviderUnavailableError,
} from '@common/errors/provider.errors';
import { PhoneHelper } from '@common/helpers/phone.helper';
import type { ICallerContext } from '@common/interfaces/caller-context.interface';
import {
  EMAIL_SENDER,
  IEmailSender,
} from '@modules/email/interfaces/email-sender.interface';
import { RecipientHelper } from '@modules/email/helpers/recipient.helper';
import { MessageDBService } from '@modules/message-db/services/message-db.service';
import {
  ISmsSender,
  SMS_SENDER,
} from '@modules/sms/interfaces/sms-sender.interface';

export interface IDispatchContext {
  caller?: ICallerContext;
  userId?: number;
  idempotencyKey?: string;
}

export interface IEmailDispatch {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
}

/** Espera sugerida antes de reintentar un envío con falla transitoria (columna `nextAttemptAt`). */
const RETRY_HINT_MS = 60_000;

/**
 * Patrón: Template de envío con ledger. Cada envío sigue los mismos pasos, sin importar canal ni
 * proveedor: (1) escribir PENDING, (2) llamar al sender, (3) registrar el resultado. Los errores
 * tipados del proveedor NO se relanzan: quedan reflejados en el estado del mensaje devuelto
 * (REJECTED / UNAVAILABLE) para que la capa API los traduzca a 502/503 con la referencia del ledger.
 * Un error propio (p. ej. la DB al escribir PENDING) sí se propaga y el proveedor ni se llama.
 */
@Injectable()
export class MessageDispatcherService {
  private readonly logger = new Logger(MessageDispatcherService.name);

  constructor(
    private readonly messages: MessageDBService,
    @Inject(SMS_SENDER) private readonly smsSender: ISmsSender,
    @Inject(EMAIL_SENDER) private readonly emailSender: IEmailSender,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  async sendSms(
    input: { to: string; text: string },
    context: IDispatchContext = {},
  ): Promise<Message> {
    let phone: string;
    try {
      phone = PhoneHelper.normalize(
        input.to,
        this.config.sms.phoneDefaultCountryCode || undefined,
      );
    } catch {
      throw new BadRequestException('Teléfono inválido.');
    }

    const ledger = await this.messages.createPending({
      channel: 'SMS',
      provider: this.smsSender.provider,
      recipient: PhoneHelper.mask(phone),
      content: input.text,
      ...this.contextFields(context),
    });

    try {
      const result = await this.smsSender.send({ to: phone, text: input.text });
      return await this.messages.markAccepted(ledger.id, {
        providerMessageId: result.messageId,
        providerStatus: result.status,
      });
    } catch (error) {
      return await this.recordFailure(ledger, error);
    }
  }

  async sendEmail(
    input: IEmailDispatch,
    context: IDispatchContext = {},
  ): Promise<Message> {
    const recipients = RecipientHelper.normalize(input);
    if (RecipientHelper.exceedsMax(recipients)) {
      throw new BadRequestException('Demasiados destinatarios.');
    }

    const ledger = await this.messages.createPending({
      channel: 'EMAIL',
      provider: this.emailSender.provider,
      recipient: RecipientHelper.maskAll(recipients),
      content: `${input.subject}\n${input.html}`,
      ...this.contextFields(context),
    });

    try {
      const result = await this.emailSender.send({ ...input, ...recipients });
      return await this.messages.markAccepted(ledger.id, {
        providerMessageId: result.messageId,
        providerStatus: 'ACCEPTED',
      });
    } catch (error) {
      return await this.recordFailure(ledger, error);
    }
  }

  private contextFields(context: IDispatchContext) {
    return {
      caller: context.caller,
      createdBy: context.userId,
      idempotencyKey: context.idempotencyKey,
    };
  }

  private async recordFailure(
    ledger: Message,
    error: unknown,
  ): Promise<Message> {
    const rejected = error instanceof ProviderRejectedError;
    const transient = error instanceof ProviderUnavailableError;
    const code =
      rejected || transient
        ? (error.code ?? error.name)
        : 'UNEXPECTED_PROVIDER_ERROR';

    if (!rejected && !transient) {
      this.logger.error(
        `Error inesperado del proveedor (mensaje ${ledger.referenceId}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return await this.messages.markFailed(
      ledger.id,
      rejected ? 'REJECTED' : 'UNAVAILABLE',
      {
        errorCode: code,
        nextAttemptAt: rejected
          ? undefined
          : new Date(Date.now() + RETRY_HINT_MS),
      },
    );
  }
}
