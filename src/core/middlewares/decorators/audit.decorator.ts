import { SetMetadata } from '@nestjs/common';

export const Audit = (table: string) => SetMetadata('audit:table', table);
