import { Injectable, Logger } from '@nestjs/common';
import {
  IPushProvider,
  IPushSendResult,
  PushSendOutcome,
} from '../interfaces/push-provider.interface';

/**
 * Null Object: reemplaza a un provider sin credenciales. No envía nada; devuelve FAILED con un
 * motivo explícito (queda en el ledger como UNAVAILABLE) en vez de simular un envío exitoso.
 */
@Injectable()
export class NoopPushProvider implements IPushProvider {
  readonly channel = null;
  readonly name = 'NOOP';
  private readonly logger = new Logger(NoopPushProvider.name);

  isEnabled(): boolean {
    return true;
  }

  send(): Promise<IPushSendResult> {
    this.logger.debug(
      'Push omitido: no hay provider configurado para el canal',
    );
    return Promise.resolve({
      outcome: PushSendOutcome.FAILED,
      error: 'PROVIDER_NOT_CONFIGURED',
    });
  }
}
