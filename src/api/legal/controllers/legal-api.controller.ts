import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  Version,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LegalDocumentType } from '@prisma/client';
import { CallerContext } from '@common/decorators/caller-context.decorator';
import { User } from '@common/decorators/user.decorator';
import { RequiresActiveConsent } from '@common/decorators/requires-active-consent.decorator';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { ICallerContext } from '@common/interfaces/caller-context.interface';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  AcceptConsentRequestDTO,
  LegalDocumentResponseDTO,
  PublishLegalVersionRequestDTO,
  RetentionPolicyResponseDTO,
  UpsertRetentionPolicyRequestDTO,
  UserConsentResponseDTO,
} from '../dtos/legal.dto';
import { LegalApiService } from '../services/legal-api.service';

@ApiTags('Legal')
@Controller('legal')
export class LegalApiController {
  constructor(private readonly legal: LegalApiService) {}

  @Get('documents')
  @Version('1')
  @ApiOperation({
    summary: 'Documentos legales vigentes (público)',
    description:
      'Una versión activa por tipo; el cliente la muestra antes de aceptar.',
  })
  @ApiOkResponse({ type: [LegalDocumentResponseDTO] })
  async listActive(): Promise<LegalDocumentResponseDTO[]> {
    return await this.legal.listActive();
  }

  @Get('documents/versions')
  @Version('1')
  @WithPermissions([PERMISSIONS.LEGAL.READ])
  @ApiOperation({ summary: 'Historial de versiones (admin)' })
  @ApiQuery({ name: 'type', enum: LegalDocumentType, required: false })
  @ApiOkResponse({ type: [LegalDocumentResponseDTO] })
  async listVersions(
    @Query('type') type?: LegalDocumentType,
  ): Promise<LegalDocumentResponseDTO[]> {
    return await this.legal.listVersions(type);
  }

  @Post('documents')
  @Version('1')
  @WithPermissions([PERMISSIONS.LEGAL.CREATE])
  @ApiOperation({
    summary: 'Publicar una versión de documento legal (admin)',
    description:
      'Con activate=true (default) la versión anterior del tipo se desactiva; los usuarios deben re-aceptar.',
  })
  @ApiCreatedResponse({ type: LegalDocumentResponseDTO })
  async publish(
    @Body() dto: PublishLegalVersionRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<LegalDocumentResponseDTO> {
    return await this.legal.publish(dto, user.email);
  }

  @Post('consents')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aceptar la versión activa de un documento' })
  @ApiCreatedResponse({ type: UserConsentResponseDTO })
  async accept(
    @Body() dto: AcceptConsentRequestDTO,
    @User() user: IUserDataOnJwt,
    @CallerContext() caller: ICallerContext,
  ): Promise<UserConsentResponseDTO> {
    return await this.legal.accept(user.id, dto.documentVersionId, caller);
  }

  @Get('consents/me')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mis consentimientos (histórico y vigentes)' })
  @ApiOkResponse({ type: [UserConsentResponseDTO] })
  async listMine(
    @User() user: IUserDataOnJwt,
  ): Promise<UserConsentResponseDTO[]> {
    return await this.legal.listMine(user.id);
  }

  @Get('consents/demo-protected')
  @Version('1')
  @RequiresActiveConsent(LegalDocumentType.PRIVACY)
  @ApiOperation({
    summary: 'DEMO de @RequiresActiveConsent',
    description:
      '403 (o 451 con CONSENT_REQUIRED_STATUS) con code CONSENT_REQUIRED hasta aceptar la política de privacidad vigente.',
  })
  @ApiOkResponse({ description: 'Consentimiento vigente.' })
  demoProtected(): { ok: true } {
    return { ok: true };
  }

  @Delete('consents/:type')
  @Version('1')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Revocar mi consentimiento de un tipo de documento',
  })
  @ApiNoContentResponse()
  async revoke(
    @Param('type', new ParseEnumPipe(LegalDocumentType))
    type: LegalDocumentType,
    @User() user: IUserDataOnJwt,
  ): Promise<void> {
    await this.legal.revoke(user.id, type);
  }

  @Get('retention-policies')
  @Version('1')
  @WithPermissions([PERMISSIONS.LEGAL.READ])
  @ApiOperation({ summary: 'Políticas de retención de datos (admin)' })
  @ApiOkResponse({ type: [RetentionPolicyResponseDTO] })
  async listPolicies(): Promise<RetentionPolicyResponseDTO[]> {
    return await this.legal.listPolicies();
  }

  @Put('retention-policies')
  @Version('1')
  @WithPermissions([PERMISSIONS.LEGAL.UPDATE])
  @ApiOperation({
    summary: 'Crear o actualizar una política de retención (admin)',
  })
  @ApiOkResponse({ type: RetentionPolicyResponseDTO })
  async upsertPolicy(
    @Body() dto: UpsertRetentionPolicyRequestDTO,
    @User() user: IUserDataOnJwt,
  ): Promise<RetentionPolicyResponseDTO> {
    return await this.legal.upsertPolicy(dto, user.email);
  }
}
