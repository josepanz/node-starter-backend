import {
  ProviderRejectedError,
  ProviderUnavailableError,
} from '@common/errors/provider.errors';

/** Infobip (u otro proveedor SMS) rechazó el envío. La API lo mapea a 502. */
export class SmsProviderError extends ProviderRejectedError {}

/** Proveedor SMS inalcanzable / timeout / 5xx / 429. La API lo mapea a 503. */
export class SmsUnavailableError extends ProviderUnavailableError {}
