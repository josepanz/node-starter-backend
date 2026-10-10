import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Message } from '@prisma/client';
import { MessageDBService } from '@modules/message-db/services/message-db.service';
import {
  IDispatchContext,
  MessageDispatcherService,
} from '@modules/messaging/services/message-dispatcher.service';
import { PaginationHelper } from '@common/helpers/pagination.helper';
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

/**
 * Capa API: orquesta DTO <-> dominio y traduce el estado del ledger a HTTP.
 * REJECTED (el proveedor dijo que no) -> 502; UNAVAILABLE (transitorio) -> 503.
 */
@Injectable()
export class MessagesApiService {
  constructor(
    private readonly dispatcher: MessageDispatcherService,
    private readonly messages: MessageDBService,
  ) {}

  async sendSms(
    dto: SendSmsRequestDTO,
    context: IDispatchContext,
  ): Promise<MessageResponseDTO> {
    return this.toResponse(await this.dispatcher.sendSms(dto, context));
  }

  async sendEmail(
    dto: SendEmailRequestDTO,
    context: IDispatchContext,
  ): Promise<MessageResponseDTO> {
    return this.toResponse(await this.dispatcher.sendEmail(dto, context));
  }

  async list(query: ListMessagesRequestDTO): Promise<MessagesListResponseDTO> {
    const { items, total } = await this.messages.list(query);
    return PaginationHelper.create(
      items.map((m) => MessageResponseDTO.fromEntity(m)),
      total,
      query.page,
      query.pageSize,
    ) as MessagesListResponseDTO;
  }

  async findOne(referenceId: string): Promise<MessageResponseDTO> {
    return MessageResponseDTO.fromEntity(
      await this.messages.findByReferenceOrFail(referenceId),
    );
  }

  async getContent(referenceId: string): Promise<MessageContentResponseDTO> {
    const message = await this.messages.findByReferenceOrFail(referenceId);
    return { referenceId, content: this.messages.revealContent(message) };
  }

  async verifyContent(
    dto: VerifyContentRequestDTO,
  ): Promise<VerifyContentResponseDTO> {
    const message = await this.messages.findByReferenceOrFail(dto.referenceId);
    return { valid: this.messages.verifyContent(message, dto.content) };
  }

  private toResponse(message: Message): MessageResponseDTO {
    const body = {
      referenceId: message.referenceId,
      status: message.status,
    };
    if (message.status === 'REJECTED') {
      throw new BadGatewayException({
        message: 'El proveedor rechazó el envío.',
        ...body,
      });
    }
    if (message.status === 'UNAVAILABLE') {
      throw new ServiceUnavailableException({
        message: 'El proveedor no está disponible, reintente.',
        ...body,
      });
    }
    return MessageResponseDTO.fromEntity(message);
  }
}
