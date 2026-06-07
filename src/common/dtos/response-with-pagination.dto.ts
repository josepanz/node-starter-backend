import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

export class PaginatedResponse<T> {
  data!: T[];
  pagination!: PaginationResponseDTO;
  additionalData?: {
    [key: string]: unknown;
  };
}
