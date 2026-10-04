import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { JsonStream } from '@common/decorators/json-stream.decorator';
import { User } from '@common/decorators/user.decorator';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import type { IJsonStreamDocument } from '@common/helpers/json-stream.helper';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import {
  AuditLogFiltersDTO,
  AuditLogResponseDTO,
  AuditLogsListResponseDTO,
  ListAuditLogsRequestDTO,
  RecentAccessRequestDTO,
  RecentAccessResponseDTO,
} from '../dtos/audit-log.dto';
import { AuditLogsApiService } from '../services/audit-logs-api.service';

@ApiTags('Audit logs')
@Controller('audit-logs')
export class AuditLogsApiController {
  constructor(private readonly auditLogs: AuditLogsApiService) {}

  @Get()
  @Version('1')
  @WithPermissions([PERMISSIONS.AUDIT_LOG.READ])
  @ApiOperation({
    summary:
      'Bitácora paginada (tabla, acción, usuario, rango de fechas, traceId)',
  })
  @ApiOkResponse({ type: AuditLogsListResponseDTO })
  async list(
    @Query() query: ListAuditLogsRequestDTO,
  ): Promise<AuditLogsListResponseDTO> {
    return await this.auditLogs.list(query);
  }

  @Get('recent-access')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mis accesos recientes (inicios de sesión)',
    description:
      'Autoservicio: solo devuelve los accesos del usuario autenticado.',
  })
  @ApiOkResponse({ type: [RecentAccessResponseDTO] })
  async recentAccess(
    @User() user: IUserDataOnJwt,
    @Query() query: RecentAccessRequestDTO,
  ): Promise<RecentAccessResponseDTO[]> {
    return await this.auditLogs.recentAccess(user.id, query.limit);
  }

  @Get('export')
  @Version('1')
  @JsonStream()
  @WithPermissions([PERMISSIONS.AUDIT_LOG.READ])
  @ApiOperation({
    summary: 'Exportar la bitácora como JSON en streaming',
    description:
      'Respuesta chunked `{ generatedAt, items: [...], total }`; recorre la tabla con cursor por lotes (memoria constante).',
  })
  @ApiProduces('application/json')
  @ApiOkResponse({ description: 'Documento JSON transmitido por chunks.' })
  export(
    @Query() query: AuditLogFiltersDTO,
  ): IJsonStreamDocument<unknown, number> {
    return this.auditLogs.buildExport(query);
  }

  @Get(':id')
  @Version('1')
  @WithPermissions([PERMISSIONS.AUDIT_LOG.READ])
  @ApiOperation({ summary: 'Detalle de un registro de bitácora' })
  @ApiOkResponse({ type: AuditLogResponseDTO })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AuditLogResponseDTO> {
    return await this.auditLogs.findOne(BigInt(id));
  }
}
