# TypeScript rules

- Use JOI for input `config-schema.ts` on all secrets.
- Explicit DTOs in NestJS, API tags, validations `(class-validator)` or `(ValidatorConstraint)` with validate and decorator, and transformations `(class-transformer)` if necessary (if applicable to multiple endpoints, create a validator and its specific decorator), with typed enums if applicable, Swagger documentation `(@nestjs/swagger, ApiProperty, ApiPropertyOptional)` and examples for both requests and responses, also for parameters and queries (use DTO in uppercase at the end), examples: GetUsersListQueryDTO, GetUserDetailParamDTO, CreateUserRequestDTO, CreateUserResponseDTO, UpdateUserRequestDTO, UpdateUserResponseDTO (not generic interfaces).
- Always generate the queryDTO, requestDTO, paramDTO under the cited rules, do not create for example @Param('id', ParseIntPipe) id: number; alone, always do everything from your dto with validation, transformation and Swagger documentation mentioned.
- Generate documentation in the docs folder to minimize content in the controller and invoke it in the controller with a decorator
- Use Prism types directly where possible; avoid remapping
- Always use Prisma Extended to coexist with the audit
- Create the interfaces, enums, types, constants, helpers for each folder, whether in /api or /module, under a folder named /interfaces, /enums, /types, /constants, /helpers to expose to the services; never place these values ​​in the services themselves.
- Do not use the repository class to call Prisma; the repository is intended solely for specific raw queries in SQL format. Integration of a `/module/*db/*.service.ts` file should call Prisma directly to execute actions on the database.
- If it's an endpoint for listing with filter parameters and pagination, use `PrismaPaginationUtil`
  - Example of use:

  ```typescript
    async getCustomersListByParams(
    queryDTO: GetCustomerRequestDTO.GetCustomersListQueryDTO,
    merchantContext: IMerchantContext,
  ): Promise<GetCustomerResponseDTO.GetCustomersListResponseDTO> {
    const customWhere: Prisma.CustomersWhereInput = {};

    if (queryDTO.search) {
      customWhere.OR = [
        { name: { contains: queryDTO.search, mode: 'insensitive' } },
        { lastname: { contains: queryDTO.search, mode: 'insensitive' } },
        { email: { contains: queryDTO.search, mode: 'insensitive' } },
        { phone: { contains: queryDTO.search, mode: 'insensitive' } },
        { documentNumber: { contains: queryDTO.search, mode: 'insensitive' } },
      ];
    }

    if (queryDTO.status !== undefined) {
      customWhere.active = queryDTO.status;
    }

    customWhere.merchantCode = merchantContext.merchantCode;

    const { data: rawOrders, pagination } =
      await PrismaPaginationUtil.paginate<CustomersWithRelations>(
        this.prisma.extended.customers as unknown as PrismaModelDelegate,
        queryDTO as unknown as Record<string, unknown>,
        {
          where: customWhere,
          include: { salesOrders: true },
          defaultOrderByField: 'createdAt',
          fieldMapping: {
            status: 'active',
          },
        },
      );

    if (rawOrders.length === 0) {
      throw new NotFoundException(
        'No se encontraron órdenes de venta para los filtros aplicados.',
      );
    }

    return {
      data: rawOrders.map((order) =>
        CustomerDBHelper.mapToCustomersResponse(order),
      ),
      pagination,
    };
  }
  ```

- No barrel exports in large libraries (tree-shaking)
- Use helpers to reduce code in services (api o module) for mapping, formatting, and auxiliary functions whenever possible. If local, create a folder (if it doesn't exist) and a helper file (if it doesn't exist; if it does, consider reusing and adding the methods) in the context of the service you're working on.
- Create interceptors or middleware whenever necessary to avoid transforming the request in the controller where applicable, for example, buffered file responses for - download, cookie responses, receiving files or data from the request manipulated from Express, and where applicable, with their respective decorator.
- Use ! in the dto definition, for example: name!: string;
- Use `.pipe` with `handleHttpErrors` to handle `firstValueFrom` errors in `rxjs` 
- Use _declare_, example: `declare pagination: PaginationResponseDTO;`
- Use the _PaginatedRequest_ and _PaginatedResponse_ class as an extension in list classes that require pagination, for example: GetUsersListQueryDTO
  - Example:

  ```typescript
  export class GetBranchRequestListQueryDTO extends PaginatedRequest<GetBranchRequestListQueryDTO> {
    @ApiPropertyOptional({
      description: 'Código del comercio',
      required: false,
    })
    @IsString({
      message: 'El código del comercio debe ser una cadena de texto',
    })
    @IsNotEmpty({ message: 'El Código de comercios no puede venir vacio.' })
    @IsOptional()
    merchantCode?: string;

    @ApiPropertyOptional({
      description: 'Código de la sucursal',
      required: false,
    })
    @IsString({
      message: 'El código de la sucursal debe ser una cadena de texto',
    })
    @IsNotEmpty({ message: 'El Código de sucursales no puede venir vacio.' })
    @IsOptional()
    branchCode?: string;

    @ApiPropertyOptional({ description: 'RUC del comercio', required: false })
    @IsString({ message: 'El RUC debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El RUC no puede venir vacio.' })
    @IsOptional()
    ruc?: string;
  }

  export class GetBranchListResponseDTO extends PaginatedResponse<GetBranchDetailResponseDTO> {
    @ApiProperty({
      description: 'Lista de comercios',
      type: [GetBranchDetailResponseDTO],
    })
    declare data: GetBranchDetailResponseDTO[];

    @ApiProperty()
    declare pagination: PaginationResponseDTO;
  }
  ```

  - _PaginatedRequest_ definition:

  ```typescript
  import { PaginationQueryDTO } from '@common/dtos/pagination.dto';

  export class PaginatedRequest<T> extends PaginationQueryDTO {
    declare filters: T;
  }
  ```

  - _PaginatedResponse_ definition:

  ```typescript
  import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

  export class PaginatedResponse<T> {
    data!: T[];
    pagination!: PaginationResponseDTO;
    additionalData?: {
      [key: string]: unknown;
    };
  }
  ```

  - _PaginationQueryDTO_ and _PaginationResponseDTO_ definition:

  ```typescript
  import { IsEndDateAfterStartDate } from '@common/validators/date-range.validator';
  import { IsOrderByFormat } from '@common/validators/is-order-by-format.validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import { Transform, Type } from 'class-transformer';
  import {
    IsDate,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Validate,
  } from 'class-validator';

  export class PaginationQueryDTO {
    @ApiPropertyOptional({
      description:
        'Pagina para paginación de resultados (opcional, por defecto 1)',
      example: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
      description:
        'Pagina para paginación de resultados (opcional, por defecto 10)',
      example: 10,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    pageSize?: number;

    @ApiPropertyOptional({
      description:
        'Campo por el cual ordenar los resultados (opcional, por defecto "fechaHora") y orden ascendente o descendente (opcional, por defecto "DESC"), separados por :',
      example: 'tradeName:desc',
    })
    @IsOptional()
    @IsString()
    @Validate(IsOrderByFormat)
    orderBy?: string;

    @ApiPropertyOptional({
      description: 'Fecha de rango de inicio de consulta',
    })
    @IsOptional()
    @IsDate()
    @Transform(({ value }) =>
      value ? new Date(`${value}T00:00:00`) : undefined,
    )
    startDate?: Date;

    @ApiPropertyOptional({ description: 'Fecha de rango de fin de consulta' })
    @IsOptional()
    @IsDate()
    @Transform(({ value }) =>
      value ? new Date(`${value}T23:59:59.999`) : undefined,
    )
    @Validate(IsEndDateAfterStartDate)
    endDate?: Date;
  }

  export class PaginationResponseDTO {
    @ApiProperty({
      description: 'Total de elementos encontrados.',
      example: 100,
    })
    @Type(() => Number)
    @IsNumber()
    total!: number;

    @ApiProperty({
      description:
        'Pagina para paginación de resultados (opcional, por defecto 1)',
      example: 1,
    })
    @Type(() => Number)
    @IsNumber()
    page!: number;

    @ApiProperty({
      description:
        'Pagina para paginación de resultados (opcional, por defecto 1).',
      example: 2,
    })
    @Type(() => Number)
    @IsNumber()
    pageSize?: number;

    @ApiProperty({
      description: 'Total de paginas disponibles.',
      example: 2,
    })
    @Type(() => Number)
    @IsNumber()
    totalPages!: number;
  }
  ```
