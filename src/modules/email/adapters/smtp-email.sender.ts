import { Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import {
  EmailProviderError,
  EmailUnavailableError,
} from '../errors/email.errors';
import { RecipientHelper } from '../helpers/recipient.helper';
import type {
  IEmailMessage,
  IEmailSender,
  IEmailSendResult,
} from '../interfaces/email-sender.interface';

export interface ISmtpOptions {
  host: string;
  port: number;
  user?: string;
  password?: string;
  from: string;
  secure?: boolean;
  timeoutMs: number;
}

/** Primer código SMTP de la familia 5xx: rechazo permanente (no se reintenta). */
const PERMANENT_SMTP_CODE = 500;

/** Adapter de `IEmailSender` sobre SMTP (nodemailer). */
export class SmtpEmailSender implements IEmailSender, OnModuleInit {
  readonly provider = 'SMTP';
  private readonly logger = new Logger(SmtpEmailSender.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private available = true;

  constructor(private readonly options: ISmtpOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure ?? options.port === 465,
      auth:
        options.user !== undefined && options.user !== ''
          ? { user: options.user, pass: options.password }
          : undefined,
      connectionTimeout: options.timeoutMs,
      greetingTimeout: options.timeoutMs,
      socketTimeout: options.timeoutMs,
    });
  }

  /** Verifica la conexión al arrancar SIN bloquear: una falla solo se loguea y queda en `isAvailable()`. */
  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();
      this.available = true;
      this.logger.log(
        `Conexión SMTP verificada ${this.options.host}:${this.options.port}`,
      );
    } catch (error) {
      this.available = false;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `No se pudo verificar SMTP al arrancar | ${RecipientHelper.maskEmailsInText(message)}`,
      );
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  async send(message: IEmailMessage): Promise<IEmailSendResult> {
    const { to, cc, bcc } = RecipientHelper.normalize(message);
    const from = message.fromName
      ? `"${message.fromName}" <${this.options.from}>`
      : this.options.from;

    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        cc,
        bcc,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
      });
      const accepted = (info.accepted ?? []).map(toAddress);
      const rejected = (info.rejected ?? []).map(toAddress);

      if (accepted.length === 0) {
        throw new EmailProviderError(
          'El servidor SMTP rechazó a todos los destinatarios',
        );
      }
      this.available = true;
      this.logger.log(
        `Correo enviado messageId=${info.messageId ?? ''} destinatarios=${accepted.length}`,
      );
      return { messageId: String(info.messageId ?? ''), accepted, rejected };
    } catch (error) {
      throw this.classify(error);
    }
  }

  private classify(error: unknown): EmailProviderError | EmailUnavailableError {
    if (error instanceof EmailProviderError) return error;

    const detail = error instanceof Error ? error.message : String(error);
    this.logger.error(
      `Error al enviar el correo | ${RecipientHelper.maskEmailsInText(detail)}`,
    );

    const code = (error as { responseCode?: number } | undefined)?.responseCode;
    if (typeof code === 'number' && code >= PERMANENT_SMTP_CODE) {
      return new EmailProviderError(
        'El servidor SMTP rechazó el mensaje',
        String(code),
      );
    }
    return new EmailUnavailableError('El servidor SMTP no está disponible');
  }
}

const toAddress = (recipient: string | { address: string }): string =>
  typeof recipient === 'string' ? recipient : recipient.address;
