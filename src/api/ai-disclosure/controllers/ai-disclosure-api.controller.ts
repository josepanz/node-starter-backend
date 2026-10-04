import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@common/decorators/user.decorator';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { AiDisclosureDBService } from '@modules/ai-disclosure-db/services/ai-disclosure-db.service';
import {
  AiDisclosureResponseDTO,
  MarkAiContentRequestDTO,
} from '../dtos/ai-disclosure.dto';

@ApiTags('AI disclosure')
@Controller('ai-disclosures')
export class AiDisclosureApiController {
  constructor(private readonly disclosures: AiDisclosureDBService) {}

  @Post()
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @WithPermissions([PERMISSIONS.AI_DISCLOSURE.CREATE])
  @ApiOperation({
    summary: 'Marcar una entidad como generada por IA (idempotente)',
    description:
      'Re-marcar la misma entidad actualiza el modelo y reinicia la revisión.',
  })
  @ApiOkResponse({ type: AiDisclosureResponseDTO })
  async mark(
    @Body() dto: MarkAiContentRequestDTO,
  ): Promise<AiDisclosureResponseDTO> {
    return AiDisclosureResponseDTO.fromEntity(await this.disclosures.mark(dto));
  }

  @Get(':entityType/:entityId')
  @Version('1')
  @WithPermissions([PERMISSIONS.AI_DISCLOSURE.READ])
  @ApiOperation({ summary: 'Consultar el disclosure de una entidad' })
  @ApiOkResponse({ type: AiDisclosureResponseDTO })
  async find(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ): Promise<AiDisclosureResponseDTO> {
    return AiDisclosureResponseDTO.fromEntity(
      await this.disclosures.find(entityType, entityId),
    );
  }

  @Post(':entityType/:entityId/review')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @WithPermissions([PERMISSIONS.AI_DISCLOSURE.UPDATE])
  @ApiOperation({ summary: 'Registrar la revisión humana del contenido' })
  @ApiOkResponse({ type: AiDisclosureResponseDTO })
  async review(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @User() user: IUserDataOnJwt,
  ): Promise<AiDisclosureResponseDTO> {
    return AiDisclosureResponseDTO.fromEntity(
      await this.disclosures.markReviewed(entityType, entityId, user.id),
    );
  }
}
