import { MaxCommaSeparatedConstraint } from '@common/validators/max-comma-separated.validator';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsMaxCommaSeparated(
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [max],
      validator: MaxCommaSeparatedConstraint,
    });
  };
}
