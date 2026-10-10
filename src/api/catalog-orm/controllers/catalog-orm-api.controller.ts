import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { CatalogOrmApiDocs } from '../docs/catalog-orm-api.docs';
import {
  CreateCatalogOrmItemRequestDTO,
  ListCatalogOrmItemsRequestDTO,
  UpdateCatalogOrmItemRequestDTO,
} from '../dtos/request';
import {
  CatalogOrmCategoryResponseDTO,
  CatalogOrmItemResponseDTO,
  CatalogOrmItemsListResponseDTO,
  CatalogOrmStockResponseDTO,
} from '../dtos/response';
import { CatalogOrmApiService } from '../services/catalog-orm-api.service';

@ApiTags('Catalog ORM (demo DB2)')
@Controller('catalog-orm')
export class CatalogOrmApiController {
  constructor(private readonly catalogApiService: CatalogOrmApiService) {}

  @Get('items')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogOrmApiDocs.list
  async list(
    @Query() query: ListCatalogOrmItemsRequestDTO,
  ): Promise<CatalogOrmItemsListResponseDTO> {
    return await this.catalogApiService.list(query);
  }

  @Get('items/:code')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogOrmApiDocs.findOne
  async findOne(
    @Param('code') code: string,
  ): Promise<CatalogOrmItemResponseDTO> {
    return await this.catalogApiService.findOne(code);
  }

  @Post('items')
  @Version('1')
  @HttpCode(HttpStatus.CREATED)
  @WithPermissions([PERMISSIONS.CATALOG.CREATE])
  @CatalogOrmApiDocs.create
  async create(
    @Body() dto: CreateCatalogOrmItemRequestDTO,
  ): Promise<CatalogOrmItemResponseDTO> {
    return await this.catalogApiService.create(dto);
  }

  @Patch('items/:code')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.UPDATE])
  @CatalogOrmApiDocs.update
  async update(
    @Param('code') code: string,
    @Body() dto: UpdateCatalogOrmItemRequestDTO,
  ): Promise<CatalogOrmItemResponseDTO> {
    return await this.catalogApiService.update(code, dto);
  }

  @Delete('items/:code')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @WithPermissions([PERMISSIONS.CATALOG.DELETE])
  @CatalogOrmApiDocs.remove
  async remove(@Param('code') code: string): Promise<void> {
    await this.catalogApiService.remove(code);
  }

  @Get('items/:code/stocks')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogOrmApiDocs.listStocks
  async listStocks(
    @Param('code') code: string,
  ): Promise<CatalogOrmStockResponseDTO[]> {
    return await this.catalogApiService.listStocks(code);
  }

  @Get('categories')
  @Version('1')
  @WithPermissions([PERMISSIONS.CATALOG.READ])
  @CatalogOrmApiDocs.listCategories
  async listCategories(): Promise<CatalogOrmCategoryResponseDTO[]> {
    return await this.catalogApiService.listCategories();
  }
}
