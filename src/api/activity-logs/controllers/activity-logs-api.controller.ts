import { Controller, Get, Query, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { ActivityLogService } from '@modules/activity-log/services/activity-log.service';
import {
  ActivityLogsListResponseDTO,
  ListActivityLogsRequestDTO,
} from '../dtos/activity-log.dto';

@ApiTags('Activity logs')
@Controller('activity-logs')
export class ActivityLogsApiController {
  constructor(private readonly activity: ActivityLogService) {}

  @Get()
  @Version('1')
  @WithPermissions([PERMISSIONS.AUDIT_LOG.READ])
  @ApiOperation({
    summary: 'Consultar el registro de actividad (Mongo opcional)',
    description:
      'Sin MONGO_URI el store es noop y la lista siempre viene vacía (`storage: noop`).',
  })
  @ApiOkResponse({ type: ActivityLogsListResponseDTO })
  async list(
    @Query() query: ListActivityLogsRequestDTO,
  ): Promise<ActivityLogsListResponseDTO> {
    return {
      storage: this.activity.storage,
      items: await this.activity.find(query),
    };
  }
}
