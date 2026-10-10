import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Version,
} from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadGatewayResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CallerContext } from '@common/decorators/caller-context.decorator';
import { User } from '@common/decorators/user.decorator';
import { WithPermissions } from '@common/decorators/with-permissions.decorator';
import { PERMISSIONS } from '@common/enum/permissions.enum';
import { ICallerContext } from '@common/interfaces/caller-context.interface';
import { IUserDataOnJwt } from '@modules/auth/interfaces/user-data-on-jwt.interface';
import {
  Idempotent,
  IdempotencyKey,
} from '@modules/idempotency/decorators/idempotency.decorators';
import { ListMessagesRequestDTO } from '../dtos/list-messages.request.dto';
import {
  MessageContentResponseDTO,
  MessageResponseDTO,
  MessagesListResponseDTO,
  VerifyContentResponseDTO,
} from '../dtos/message.response.dto';
import { SendEmailRequestDTO } from '../dtos/send-email.request.dto';
import { SendSmsRequestDTO } from '../dtos/send-sms.request.dto';
import { VerifyContentRequestDTO } from '../dtos/verify-content.request.dto';
import { MessagesApiService } from '../services/messages-api.service';

@ApiTags('Messages (demo)')
@Controller('messages')
export class MessagesApiController {
  constructor(private readonly messagesApiService: MessagesApiService) {}

  @Post('sms')
  @Version('1')
  @HttpCode(HttpStatus.ACCEPTED)
  @WithPermissions([PERMISSIONS.MESSAGE.SEND])
  @Idempotent()
  @ApiOperation({
    summary: 'Enviar un SMS (idempotente)',
    description:
      'Escribe el mensaje PENDING en el ledger, llama al proveedor (Infobip o consola) y registra el resultado. Requiere Idempotency-Key.',
  })
  @ApiAcceptedResponse({ type: MessageResponseDTO })
  @ApiBadGatewayResponse({ description: 'El proveedor rechazó el envío.' })
  @ApiServiceUnavailableResponse({ description: 'Proveedor no disponible.' })
  async sendSms(
    @Body() dto: SendSmsRequestDTO,
    @User() user: IUserDataOnJwt,
    @CallerContext() caller: ICallerContext,
    @IdempotencyKey() idempotencyKey?: string,
  ): Promise<MessageResponseDTO> {
    return await this.messagesApiService.sendSms(dto, {
      caller,
      userId: user.id,
      idempotencyKey,
    });
  }

  @Post('email')
  @Version('1')
  @HttpCode(HttpStatus.ACCEPTED)
  @WithPermissions([PERMISSIONS.MESSAGE.SEND])
  @Idempotent({ required: false })
  @ApiOperation({ summary: 'Enviar un correo (SMTP o consola)' })
  @ApiAcceptedResponse({ type: MessageResponseDTO })
  @ApiBadGatewayResponse({ description: 'El servidor SMTP rechazó el envío.' })
  @ApiServiceUnavailableResponse({ description: 'SMTP no disponible.' })
  async sendEmail(
    @Body() dto: SendEmailRequestDTO,
    @User() user: IUserDataOnJwt,
    @CallerContext() caller: ICallerContext,
    @IdempotencyKey() idempotencyKey?: string,
  ): Promise<MessageResponseDTO> {
    return await this.messagesApiService.sendEmail(dto, {
      caller,
      userId: user.id,
      idempotencyKey,
    });
  }

  @Get()
  @Version('1')
  @WithPermissions([PERMISSIONS.MESSAGE.READ])
  @ApiOperation({
    summary: 'Listar el ledger de mensajes (paginado, con filtros)',
  })
  @ApiOkResponse({ type: MessagesListResponseDTO })
  async list(
    @Query() query: ListMessagesRequestDTO,
  ): Promise<MessagesListResponseDTO> {
    return await this.messagesApiService.list(query);
  }

  @Post('verify-content')
  @Version('1')
  @HttpCode(HttpStatus.OK)
  @WithPermissions([PERMISSIONS.MESSAGE.VERIFY])
  @ApiOperation({
    summary: 'Verificar contenido por HMAC',
    description:
      'Compara el contenido enviado con la huella guardada sin revelar el contenido original.',
  })
  @ApiOkResponse({ type: VerifyContentResponseDTO })
  async verifyContent(
    @Body() dto: VerifyContentRequestDTO,
  ): Promise<VerifyContentResponseDTO> {
    return await this.messagesApiService.verifyContent(dto);
  }

  @Get(':referenceId')
  @Version('1')
  @WithPermissions([PERMISSIONS.MESSAGE.READ])
  @ApiOperation({ summary: 'Detalle de un mensaje (sin contenido)' })
  @ApiOkResponse({ type: MessageResponseDTO })
  async findOne(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
  ): Promise<MessageResponseDTO> {
    return await this.messagesApiService.findOne(referenceId);
  }

  @Get(':referenceId/content')
  @Version('1')
  @WithPermissions([PERMISSIONS.MESSAGE.READ_CONTENT])
  @ApiOperation({
    summary: 'Contenido descifrado de un mensaje',
    description:
      'Solo con política AUDIT y antes de que venza la retención. Permiso especial.',
  })
  @ApiOkResponse({ type: MessageContentResponseDTO })
  async getContent(
    @Param('referenceId', ParseUUIDPipe) referenceId: string,
  ): Promise<MessageContentResponseDTO> {
    return await this.messagesApiService.getContent(referenceId);
  }
}
