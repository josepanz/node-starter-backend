import type {
  MessageChannel,
  MessageContentPolicy,
  MessageStatus,
} from '@prisma/client';
import type { ICallerContext } from '@common/interfaces/caller-context.interface';

export interface ICreatePendingMessage {
  channel: MessageChannel;
  provider: string;
  /** Ya enmascarado por el caller: el ledger nunca guarda el destinatario en claro. */
  recipient: string;
  /** Contenido a proteger según la política (cifrado AUDIT) y a huellar con HMAC. */
  content?: string;
  contentPolicy?: MessageContentPolicy;
  caller?: ICallerContext;
  createdBy?: number;
  idempotencyKey?: string;
  resentFromId?: number;
}

export interface IMessageListFilters {
  channel?: MessageChannel;
  status?: MessageStatus;
  provider?: string;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
}

export interface IProtectedContent {
  contentPolicy: MessageContentPolicy;
  contentEncrypted: string | null;
  contentHmac: string | null;
  contentExpiresAt: Date | null;
}
