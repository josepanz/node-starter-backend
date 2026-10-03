import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import {
  passwordPolicyFromEnv,
  PasswordPolicy,
  validatePasswordPolicy,
} from '@modules/auth/helpers/password-policy.helper';

/**
 * Patrón: adapter de class-validator sobre el helper puro. Sin `policy` explícita lee la
 * política configurada por env al validar, así cambiarla no requiere tocar los DTOs.
 * Para DTOs con contraseña en claro (las que llegan cifradas se validan en el servicio).
 */
export function IsPasswordCompliant(
  policy?: PasswordPolicy,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isPasswordCompliant',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' &&
          validatePasswordPolicy(value, policy ?? passwordPolicyFromEnv())
            .valid,
        defaultMessage: (args: ValidationArguments) => {
          const value = args.value as unknown;
          const { violations } = validatePasswordPolicy(
            typeof value === 'string' ? value : '',
            policy ?? passwordPolicyFromEnv(),
          );
          return `${args.property}: ${violations.join('; ')}`;
        },
      },
    });
  };
}
