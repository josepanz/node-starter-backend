import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

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
      this.message = 'startDate es requerido';
      return false;
    }

    if (new Date(endDate as Date) < new Date(obj.startDate)) {
      this.message = 'endDate debe ser posterior a startDate';
      return false;
    }

    return true;
  }

  defaultMessage(): string {
    return this.message || 'endDate inválida';
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
    return 'El rango de fechas no puede superar los 6 meses.';
  }
}
