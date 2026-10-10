import { registerDecorator, ValidationOptions } from 'class-validator';
import { APP_CONFIG } from '@core/config/config-loader';
import { PhoneHelper } from '@common/helpers/phone.helper';
import { t } from '@common/i18n/i18n.helper';

/**
 * Valida que el valor sea un teléfono normalizable a E.164. Si hay `PHONE_DEFAULT_COUNTRY_CODE`
 * acepta también formato nacional; si no, exige `+<país>...`. Delega en `PhoneHelper` (DRY).
 */
export function IsPhoneNumber(options?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol): void => {
    registerDecorator({
      name: 'isPhoneNumber',
      target: target.constructor,
      propertyName: propertyName as string,
      options: {
        message: ({ property }) => t('validation.PHONE_INVALID', { property }),
        ...options,
      },
      validator: {
        validate: (value: unknown): boolean =>
          typeof value === 'string' &&
          PhoneHelper.isValid(
            value,
            APP_CONFIG().sms.phoneDefaultCountryCode || undefined,
          ),
      },
    });
  };
}
