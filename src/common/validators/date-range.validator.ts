import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { t } from '@common/i18n/i18n.helper';

export interface DateRangeDTO {
  startDate?: Date;
  endDate?: Date;
}

@ValidatorConstraint({ name: 'IsEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDate implements ValidatorConstraintInterface {
  private message: string = '';
  validate(endDate: unknown, args: ValidationArguments) {
    const obj = args.object as DateRangeDTO;
    if (!obj.startDate) {
      this.message = t('validation.START_DATE_REQUIRED');
      return false;
    }

    if (new Date(endDate as Date) < new Date(obj.startDate)) {
      this.message = t('validation.END_DATE_AFTER_START');
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return this.message || t('validation.END_DATE_INVALID');
  }
}

@ValidatorConstraint({ name: 'IsDateRangeWithinSixMonths', async: false })
export class IsDateRangeWithinSixMonths
  implements ValidatorConstraintInterface
{
  validate(endDate: unknown, args: ValidationArguments): boolean {
    const obj = args.object as DateRangeDTO;
    if (!obj.startDate || endDate == null) return true;
    const start = new Date(obj.startDate);
    const end = new Date(endDate as Date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
    const maxEnd = new Date(start);
    maxEnd.setMonth(maxEnd.getMonth() + 6);
    return end <= maxEnd;
  }

  defaultMessage(): string {
    return t('validation.DATE_RANGE_MAX_SIX_MONTHS');
  }
}
