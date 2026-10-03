import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PushChannel } from '@prisma/client';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import {
  IPushPayload,
  IPushProvider,
  IPushSendResult,
  IPushTarget,
  PushSendOutcome,
} from '../interfaces/push-provider.interface';

const APP_NAME = 'starter-fcm';
const GONE_CODES: ReadonlySet<string> = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/**
 * Adapter FCM (`firebase-admin`). Credenciales opcionales: si faltan o son inválidas el provider
 * queda deshabilitado (`isEnabled() === false`) y NUNCA tumba el arranque.
 */
@Injectable()
export class FcmPushProvider implements IPushProvider {
  readonly channel = PushChannel.FCM;
  readonly name = 'FCM';
  private readonly logger = new Logger(FcmPushProvider.name);
  private app: App | null = null;

  constructor(@Inject(APP_CONFIG.KEY) config: ConfigType<AppConfigType>) {
    const { projectId, clientEmail, privateKey } = config.push.firebase;
    if (!projectId || !clientEmail || !privateKey) return;

    try {
      this.app =
        getApps().find((existing) => existing.name === APP_NAME) ??
        initializeApp(
          { credential: cert({ projectId, clientEmail, privateKey }) },
          APP_NAME,
        );
    } catch (error) {
      this.app = null;
      this.logger.warn(
        `Credenciales de Firebase inválidas, FCM deshabilitado: ${error instanceof Error ? error.message : 'error'}`,
      );
    }
  }

  isEnabled(): boolean {
    return this.app !== null;
  }

  async send(
    target: IPushTarget,
    payload: IPushPayload,
  ): Promise<IPushSendResult> {
    if (!this.app) {
      return { outcome: PushSendOutcome.FAILED, error: 'FCM no configurado' };
    }

    try {
      const providerMessageId = await getMessaging(this.app).send({
        token: target.token,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      });
      return { outcome: PushSendOutcome.SENT, providerMessageId };
    } catch (error) {
      const code = (error as { code?: string } | undefined)?.code;
      if (code && GONE_CODES.has(code)) {
        return { outcome: PushSendOutcome.GONE, error: code };
      }
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Fallo al enviar FCM: ${message}`);
      return { outcome: PushSendOutcome.FAILED, error: code ?? message };
    }
  }
}
