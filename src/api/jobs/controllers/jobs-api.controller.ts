import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
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
import { JobsApiService } from '../services/jobs-api.service';
import { EnqueueJobRequestDTO } from '../dtos/enqueue-job.request.dto';
import { JobResponseDTO } from '../dtos/job.response.dto';

@ApiTags('Jobs (demo)')
@Controller('jobs')
export class JobsApiController {
  constructor(private readonly jobsApiService: JobsApiService) {}

  @Get('types')
  @Version('1')
  @WithPermissions([PERMISSIONS.JOB.READ])
  @ApiOperation({ summary: 'Tipos de job registrados' })
  listTypes(): { types: string[] } {
    return this.jobsApiService.listTypes();
  }

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.ACCEPTED)
  @WithPermissions([PERMISSIONS.JOB.CREATE])
  @ApiOperation({
    summary: 'Encolar un job',
    description:
      'Demo: type `report.export` genera un Excel. El worker lo toma en el próximo ciclo.',
  })
  @ApiCreatedResponse({ type: JobResponseDTO })
  async enqueue(
    @Body() dto: EnqueueJobRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<JobResponseDTO> {
    return await this.jobsApiService.enqueue(dto, user.id);
  }

  @Get(':referenceId')
  @Version('1')
  @WithPermissions([PERMISSIONS.JOB.READ])
  @ApiOperation({ summary: 'Estado de un job' })
  @ApiOkResponse({ type: JobResponseDTO })
  @ApiNotFoundResponse({ description: 'Job no encontrado.' })
  async findOne(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
  ): Promise<JobResponseDTO> {
    return await this.jobsApiService.findOne(referenceId);
  }

  @Post(':referenceId/requeue')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @WithPermissions([PERMISSIONS.JOB.REQUEUE])
  @ApiOperation({ summary: 'Reencolar manualmente un job FAILED' })
  @ApiOkResponse({ type: JobResponseDTO })
  @ApiConflictResponse({ description: 'El job no está en FAILED.' })
  async requeue(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
  ): Promise<JobResponseDTO> {
    return await this.jobsApiService.requeue(referenceId);
  }
}
