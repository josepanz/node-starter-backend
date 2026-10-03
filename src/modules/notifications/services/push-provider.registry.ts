import { Inject, Injectable } from '@nestjs/common';
import type { PushChannel } from '@prisma/client';
import {
  IPushProvider,
  PUSH_PROVIDERS,
} from '../interfaces/push-provider.interface';
import { NoopPushProvider } from '../providers/noop-push.provider';

/** Resuelve el provider de un canal: el habilitado si existe, si no el Noop (nunca null). */
@Injectable()
export class PushProviderRegistry {
  constructor(
    @Inject(PUSH_PROVIDERS) private readonly providers: IPushProvider[],
    private readonly noop: NoopPushProvider,
  ) {}

  forChannel(channel: PushChannel): IPushProvider {
    return (
      this.providers.find((p) => p.channel === channel && p.isEnabled()) ??
      this.noop
    );
  }
}
