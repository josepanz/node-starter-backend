import { PaginationQueryDTO } from '@common/dtos/pagination.dto';

export class PaginatedRequest<T> extends PaginationQueryDTO {
  declare filters: T;
}
