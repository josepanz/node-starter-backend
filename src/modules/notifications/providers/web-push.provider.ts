import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PushChannel } from '@prisma/client';
import * as webpush from 'web-push';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import {
  IPushPayload,
  IPushProvider,
  IPushSendResult,
  IPushTarget,
  PushSendOutcome,
} from '../interfaces/push-provider.interface';

/**
 * Adapter Web Push (VAPID). Las claves se pasan por llamada (`vapidDetails`) en vez de
 * `setVapidDetails` global, así no hay estado compartido entre providers ni entre tests.
 */
@Injectable()
export class WebPushProvider implements IPushProvider {
  readonly channel = PushChannel.WEBPUSH;
  readonly name = 'WEBPUSH';
  private readonly logger = new Logger(WebPushProvider.name);
  private readonly vapid: webpush.VapidKeys & { subject: string };
  private readonly enabled: boolean;

  constructor(@Inject(APP_CONFIG.KEY) config: ConfigType<AppConfigType>) {
    const { publicKey, privateKey, subject } = config.push.webPush;
    this.vapid = { publicKey, privateKey, subject };
    this.enabled = Boolean(publicKey && privateKey && subject);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Clave pública VAPID para que el front se suscriba (`applicationServerKey`). */
  getPublicKey(): string {
    return this.vapid.publicKey;
  }

  async send(
    target: IPushTarget,
    payload: IPushPayload,
  ): Promise<IPushSendResult> {
    if (!this.enabled) {
      return {
        outcome: PushSendOutcome.FAILED,
        error: 'VAPID no configurado',
      };
    }
    if (!target.p256dh || !target.auth) {
      return {
        outcome: PushSendOutcome.GONE,
        error: 'Suscripción sin claves p256dh/auth',
      };
    }

    try {
      await webpush.sendNotification(
        {
          endpoint: target.token,
          keys: { p256dh: target.p256dh, auth: target.auth },
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          data: payload.data,
        }),
        {
          vapidDetails: {
            subject: this.vapid.subject,
            publicKey: this.vapid.publicKey,
            privateKey: this.vapid.privateKey,
          },
        },
      );
      return { outcome: PushSendOutcome.SENT };
    } catch (error) {
      const statusCode = (error as { statusCode?: number } | undefined)
        ?.statusCode;
      if (statusCode === 404 || statusCode === 410) {
        return { outcome: PushSendOutcome.GONE, error: String(statusCode) };
      }
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.error(`Fallo al enviar Web Push: ${message}`);
      return { outcome: PushSendOutcome.FAILED, error: message };
    }
  }
}
