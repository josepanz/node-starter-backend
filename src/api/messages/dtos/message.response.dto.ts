import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Message,
  MessageChannel,
  MessageContentPolicy,
  MessageStatus,
} from '@prisma/client';
import { PaginationResponseDTO } from '@common/dtos/pagination.dto';

export class MessageResponseDTO {
  @ApiProperty() referenceId!: string;
  @ApiProperty({ enum: MessageChannel }) channel!: MessageChannel;
  @ApiProperty({ example: 'INFOBIP' }) provider!: string;
  @ApiProperty({ example: '***100', description: 'Siempre enmascarado.' })
  recipient!: string;
  @ApiProperty({ enum: MessageStatus }) status!: MessageStatus;
  @ApiPropertyOptional({ nullable: true }) providerMessageId!: string | null;
  @ApiPropertyOptional({ nullable: true }) providerStatus!: string | null;
  @ApiPropertyOptional({ nullable: true }) providerErrorCode!: string | null;
  @ApiProperty() attempts!: number;
  @ApiPropertyOptional({ nullable: true }) nextAttemptAt!: Date | null;
  @ApiPropertyOptional({ nullable: true }) traceId!: string | null;
  @ApiProperty({ enum: MessageContentPolicy })
  contentPolicy!: MessageContentPolicy;
  @ApiProperty({ description: 'Hay contenido cifrado disponible.' })
  hasContent!: boolean;
  @ApiPropertyOptional({ nullable: true }) contentExpiresAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromEntity(message: Message): MessageResponseDTO {
    return {
      referenceId: message.referenceId,
      channel: message.channel,
      provider: message.provider,
      recipient: message.recipient,
      status: message.status,
      providerMessageId: message.providerMessageId,
      providerStatus: message.providerStatus,
      providerErrorCode: message.providerErrorCode,
      attempts: message.attempts,
      nextAttemptAt: message.nextAttemptAt,
      traceId: message.traceId,
      contentPolicy: message.contentPolicy,
      hasContent: message.contentEncrypted !== null,
      contentExpiresAt: message.contentExpiresAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}

export class MessagesListResponseDTO {
  @ApiProperty({ type: [MessageResponseDTO] })
  data!: MessageResponseDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}

export class MessageContentResponseDTO {
  @ApiProperty() referenceId!: string;
  @ApiProperty() content!: string;
}

export class VerifyContentResponseDTO {
  @ApiProperty({ description: 'El contenido coincide con la huella HMAC.' })
  valid!: boolean;
}
