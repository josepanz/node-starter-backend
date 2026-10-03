import {
  ProviderRejectedError,
  ProviderUnavailableError,
} from '@common/errors/provider.errors';

/** El servidor SMTP respondió con un error permanente. La API lo mapea a 502. */
export class EmailProviderError extends ProviderRejectedError {}

/** SMTP inalcanzable, timeout o falla transitoria. La API lo mapea a 503. */
export class EmailUnavailableError extends ProviderUnavailableError {}
