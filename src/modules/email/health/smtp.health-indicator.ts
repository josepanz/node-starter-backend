import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import {
  EMAIL_SENDER,
  IEmailSender,
} from '../interfaces/email-sender.interface';

/**
 * Indicador INFORMATIVO: se expone en la respuesta del healthcheck pero NO participa de
 * `HealthCheckService.check`, así un SMTP caído no marca al servicio entero como no saludable
 * (el correo es una dependencia degradable, no crítica).
 */
@Injectable()
export class SmtpHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(EMAIL_SENDER) private readonly sender: IEmailSender,
  ) {}

  check(): HealthIndicatorResult<'smtp'> {
    const session = this.healthIndicatorService.check('smtp');
    return this.sender.isAvailable()
      ? session.up({ provider: this.sender.provider })
      : session.down({
          provider: this.sender.provider,
          message: 'SMTP no disponible',
        });
  }
}
