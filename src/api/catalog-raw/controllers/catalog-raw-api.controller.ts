import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { User } from '@common/decorators/user.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { CatalogRawApiDocs } from '../docs/catalog-raw-api.docs';
import {
  ChangeCatalogItemsStatusRequestDTO,
  CreateCatalogItemRequestDTO,
  ListCatalogItemsRequestDTO,
  UpdateCatalogPricesRequestDTO,
} from '../dtos/request';
import {
  AffectedRowsResponseDTO,
  CatalogItemResponseDTO,
  CatalogItemsListResponseDTO,
  ProcedureResultResponseDTO,
} from '../dtos/response';
import { CatalogRawApiService } from '../services/catalog-raw-api.service';

@ApiTags('Catalog raw (demo DB2)')
@Controller('catalog-raw')
export class CatalogRawApiController {
  constructor(private readonly catalogApiService: CatalogRawApiService) {}

  @Get('items')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogRawApiDocs.list
  async list(
    @Query() query: ListCatalogItemsRequestDTO,
  ): Promise<CatalogItemsListResponseDTO> {
    return await this.catalogApiService.list(query);
  }

  @Get('items/:code')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogRawApiDocs.findOne
  async findOne(@Param('code') code: string): Promise<CatalogItemResponseDTO> {
    return await this.catalogApiService.findOne(code);
  }

  @Post('items')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @WithPermissions([PERMISSIONS.CATALOG.CREATE])
  @CatalogRawApiDocs.create
  async create(
    @Body() dto: CreateCatalogItemRequestDTO,
  ): Promise<CatalogItemResponseDTO> {
    return await this.catalogApiService.create(dto);
  }

  @Patch('items/status')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.UPDATE])
  @CatalogRawApiDocs.changeStatus
  async changeStatus(
    @Body() dto: ChangeCatalogItemsStatusRequestDTO,
  ): Promise<AffectedRowsResponseDTO> {
    return await this.catalogApiService.changeStatus(dto);
  }

  @Put('items/prices')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.UPDATE])
  @CatalogRawApiDocs.updatePrices
  async updatePrices(
    @Body() dto: UpdateCatalogPricesRequestDTO,
  ): Promise<AffectedRowsResponseDTO> {
    return await this.catalogApiService.updatePrices(dto);
  }

  @Get('categories/:categoryCode/items')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogRawApiDocs.listByCategory
  async listByCategory(
    @Param('categoryCode') categoryCode: string,
  ): Promise<CatalogItemResponseDTO[]> {
    return await this.catalogApiService.listByCategory(categoryCode);
  }

  @Post('categories/:categoryCode/recalculate')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @WithPermissions([PERMISSIONS.CATALOG.UPDATE])
  @CatalogRawApiDocs.recalculate
  async recalculate(
    @Param('categoryCode') categoryCode: string,
    @User() user: IUserDataOnJwt,
  ): Promise<ProcedureResultResponseDTO[]> {
    return await this.catalogApiService.recalculate(categoryCode, user.email);
  }
}
