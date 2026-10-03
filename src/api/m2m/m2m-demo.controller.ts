import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SkipRateLimit } from '@core/rate-limit/rate-limit.decorators';
import { BasicAuthGuard } from '@modules/auth/guards/basic-auth.guard';
import { HmacSignatureGuard } from '@modules/auth/guards/hmac-signature.guard';
import { ApiClientThrottlerGuard } from '@modules/auth/guards/api-client-throttler.guard';
import {
  ApiClientScopes,
  CurrentApiClient,
} from '@modules/auth/decorators/api-client.decorators';
import { API_CLIENT_SCOPES } from '@modules/api-clients-db/constants/api-client-scopes.constants';
import type { IApiClientPrincipal } from '@modules/api-clients-db/interfaces/api-client.interface';
import { M2mEchoRequestDTO } from './m2m-demo.dto';

/**
 * DEMO del canal M2M: cadena de guards Basic (identidad + scopes + IPs) -> HMAC (firma, opcional
 * por credencial) -> rate limit por credencial. `@SkipRateLimit()` evita doble conteo con los
 * limiters globales por IP.
 */
@ApiTags('M2M (demo)')
@ApiBasicAuth()
@SkipRateLimit()
@UseGuards(BasicAuthGuard, HmacSignatureGuard, ApiClientThrottlerGuard)
@Controller('m2m')
export class M2mDemoController {
  @Get('ping')
  @Version('1')
  @ApiClientScopes(API_CLIENT_SCOPES.DEMO_READ)
  @ApiOperation({ summary: 'Ping M2M (scope demo:read)' })
  ping(@CurrentApiClient() client: IApiClientPrincipal | undefined) {
    return {
      ok: true,
      clientId: client?.id,
      clientName: client?.name,
      scopes: client?.scopes ?? [],
    };
  }

  @Post('echo')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @ApiClientScopes(API_CLIENT_SCOPES.DEMO_WRITE)
  @ApiHeader({
    name: 'X-Signature',
    required: false,
    description: 'HMAC-SHA256 hex (si la credencial tiene HMAC).',
  })
  @ApiHeader({
    name: 'X-Timestamp',
    required: false,
    description: 'Epoch en segundos.',
  })
  @ApiHeader({
    name: 'X-Nonce',
    required: false,
    description: 'Nonce de un solo uso (anti-replay).',
  })
  @ApiOperation({
    summary: 'Echo M2M firmable (scope demo:write)',
    description:
      'Firma: HMAC-SHA256(secret, `METHOD\npath\ntimestamp\nsha256(body)[\nnonce]`).',
  })
  echo(
    @Body() dto: M2mEchoRequestDTO,
    @CurrentApiClient() client: IApiClientPrincipal | undefined,
  ) {
    return { clientId: client?.id, message: dto.message };
  }
}
