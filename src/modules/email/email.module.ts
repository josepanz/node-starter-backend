import { Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConsoleEmailSender } from '@modules/email/adapters/console-email.sender';
import { SmtpEmailSender } from '@modules/email/adapters/smtp-email.sender';
import { SmtpHealthIndicator } from '@modules/email/health/smtp.health-indicator';
import {
  EMAIL_SENDER,
  IEmailSender,
} from '@modules/email/interfaces/email-sender.interface';
import { EmailService } from '@modules/email/services/email.service';

/**
 * Patrón: Factory por configuración. Con `EMAIL_HOST` se usa SMTP; sin él, `ConsoleEmailSender`
 * (solo loguea), de modo que la app arranca y los flujos de correo son probables sin servidor.
 */
@Module({
  imports: [TerminusModule],
  providers: [
    {
      provide: EMAIL_SENDER,
      inject: [APP_CONFIG.KEY],
      useFactory: (config: ConfigType<AppConfigType>): IEmailSender => {
        const { host, port, user, password, dir, secure, timeoutMs } =
          config.email;
        return host
          ? new SmtpEmailSender({
              host,
              port,
              user,
              password,
              from: dir || 'no-reply@localhost',
              secure,
              timeoutMs,
            })
          : new ConsoleEmailSender();
      },
    },
    EmailService,
    SmtpHealthIndicator,
  ],
  exports: [EmailService, EMAIL_SENDER, SmtpHealthIndicator],
})
export class EmailModule {}
