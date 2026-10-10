import { ServiceUnavailableException } from '@nestjs/common';
import { t } from '@common/i18n/i18n.helper';

/**
 * Patrón: guard de disponibilidad (fail-clear). Los módulos de datos Sequelize solo existen si
 * `DATABASE_CONNECTION_STRING` está definido; la capa API inyecta su servicio como `@Optional()` y
 * pasa por aquí para responder 503 con un mensaje claro en vez de fallar al arrancar o con un 500.
 */
export function requireDatabase<T>(dependency: T | undefined): T {
  if (!dependency) {
    throw new ServiceUnavailableException(t('common.DATABASE_NOT_CONFIGURED'));
  }
  return dependency;
}
