import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

export type SortDirection = 'desc' | 'asc';

@ValidatorConstraint({ name: 'isOrderByFormat', async: false })
export class IsOrderByFormat implements ValidatorConstraintInterface {
  validate(value: string) {
    if (typeof value !== 'string') return false;
    const [field, direction] = value.split(':');
    return Boolean(field) && ['asc', 'desc'].includes(direction.toLowerCase());
  }

  defaultMessage() {
    return `orderBy must be in the format 'field:asc' or 'field:desc'`;
  }
}
