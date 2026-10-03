import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { User } from '@common/decorators/user.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { ApiClientsApiService } from '../services/api-clients-api.service';
import {
  CreateApiClientRequestDTO,
  ListApiClientsRequestDTO,
  UpdateApiClientSettingsRequestDTO,
  UpdateApiClientStatusRequestDTO,
} from '../dtos/api-clients.request.dto';
import {
  ApiClientResponseDTO,
  ApiClientsListResponseDTO,
  ApiClientWithSecretsResponseDTO,
} from '../dtos/api-clients.response.dto';

// Las respuestas con secretos no deben cachearse (proxies/browser).
const NO_STORE = 'no-store';

@ApiTags('API Clients (M2M)')
@Controller('api-clients')
export class ApiClientsApiController {
  constructor(private readonly apiClientsApiService: ApiClientsApiService) {}

  @Post()
  @Version('1')
  @Header('Cache-Control', NO_STORE)
  @WithPermissions([PERMISSIONS.API_CLIENT.CREATE])
  @ApiOperation({
    summary: 'Crear credencial M2M',
    description:
      'Devuelve clientSecret (y signingSecret si HMAC) una única vez; en DB solo queda el hash.',
  })
  @ApiCreatedResponse({ type: ApiClientWithSecretsResponseDTO })
  async create(
    @Body() dto: CreateApiClientRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<ApiClientWithSecretsResponseDTO> {
    return await this.apiClientsApiService.create(dto, user.email);
  }

  @Get()
  @Version('1')
  @WithPermissions([PERMISSIONS.API_CLIENT.READ])
  @ApiOperation({ summary: 'Listar credenciales (paginado)' })
  @ApiOkResponse({ type: ApiClientsListResponseDTO })
  async list(
    @Query() query: ListApiClientsRequestDTO,
  ): Promise<ApiClientsListResponseDTO> {
    return await this.apiClientsApiService.list(query);
  }

  @Get(':referenceId')
  @Version('1')
  @WithPermissions([PERMISSIONS.API_CLIENT.READ])
  @ApiOperation({ summary: 'Detalle de una credencial (sin secretos)' })
  @ApiOkResponse({ type: ApiClientResponseDTO })
  @ApiNotFoundResponse({ description: 'Credencial no encontrada.' })
  async findOne(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
  ): Promise<ApiClientResponseDTO> {
    return await this.apiClientsApiService.findOne(referenceId);
  }

  @Patch(':referenceId/status')
  @Version('1')
  @WithPermissions([PERMISSIONS.API_CLIENT.UPDATE])
  @ApiOperation({ summary: 'Activar/desactivar una credencial' })
  @ApiOkResponse({ type: ApiClientResponseDTO })
  async toggleStatus(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @Body() dto: UpdateApiClientStatusRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<ApiClientResponseDTO> {
    return await this.apiClientsApiService.toggleStatus(
      referenceId,
      dto,
      user.email,
    );
  }

  @Post(':referenceId/regenerate-secret')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', NO_STORE)
  @WithPermissions([PERMISSIONS.API_CLIENT.ROTATE_SECRET])
  @ApiOperation({
    summary: 'Regenerar secret',
    description: 'El secret anterior deja de ser válido de inmediato.',
  })
  @ApiOkResponse({ type: ApiClientWithSecretsResponseDTO })
  @ApiConflictResponse({ description: 'La credencial está inactiva.' })
  async regenerateSecret(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @User() user: IUserDataOnJwt,
  ): Promise<ApiClientWithSecretsResponseDTO> {
    return await this.apiClientsApiService.regenerateSecret(
      referenceId,
      user.email,
    );
  }

  @Patch(':referenceId/settings')
  @Version('1')
  @Header('Cache-Control', NO_STORE)
  @WithPermissions([PERMISSIONS.API_CLIENT.UPDATE])
  @ApiOperation({
    summary: 'Actualizar scopes, rate limit, IPs y HMAC',
    description:
      'Si activa HMAC, la respuesta incluye el signing secret (única vez).',
  })
  @ApiOkResponse({ type: ApiClientWithSecretsResponseDTO })
  async updateSettings(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
    @Body() dto: UpdateApiClientSettingsRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<ApiClientWithSecretsResponseDTO> {
    return await this.apiClientsApiService.updateSettings(
      referenceId,
      dto,
      user.email,
    );
  }
}
