import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MessageContentPolicy } from '@prisma/client';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import {
  decryptAesGcm,
  encryptAesGcm,
  Keyring,
  parseKeyring,
} from '@common/helpers/crypto/aes-gcm.helper';
import {
  hmacSha256Hex,
  verifyHmacSha256,
} from '@common/helpers/crypto/hmac.helper';
import type { IProtectedContent } from '../interfaces/message.interface';

const DAY_MS = 86_400_000;

/**
 * Patrón: política de contenido por mensaje. El ledger guarda SIEMPRE una huella HMAC del contenido
 * (permite verificar sin conservarlo) y, solo con política AUDIT, el contenido cifrado con
 * AES-256-GCM (keyring con rotación) y una fecha de expiración. Si AUDIT se pide pero no hay claves
 * de cifrado configuradas, se degrada a NONE con aviso: nunca se guarda contenido en claro.
 */
@Injectable()
export class MessageContentService {
  private readonly logger = new Logger(MessageContentService.name);
  private readonly keyring: Keyring;
  private readonly activeKeyId: string;
  private readonly hmacSecret: string;

  constructor(
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {
    const { encryptionKeys, encryptionActiveKeyId, hmacSecret } =
      config.security;
    let keyring: Keyring = new Map();
    try {
      keyring = parseKeyring(encryptionKeys);
    } catch (error) {
      this.logger.warn(
        `ENCRYPTION_KEYS inválido, el cifrado de contenido queda deshabilitado: ${error instanceof Error ? error.message : 'error'}`,
      );
    }
    this.keyring = keyring;
    this.activeKeyId = encryptionActiveKeyId;
    this.hmacSecret = hmacSecret;
  }

  get canEncrypt(): boolean {
    return this.keyring.has(this.activeKeyId);
  }

  get canHmac(): boolean {
    return this.hmacSecret.length > 0;
  }

  resolvePolicy(requested?: MessageContentPolicy): MessageContentPolicy {
    const policy = requested ?? this.config.messages.contentPolicy;
    if (policy === MessageContentPolicy.AUDIT && !this.canEncrypt) {
      this.logger.warn(
        'Política AUDIT sin ENCRYPTION_KEYS/ENCRYPTION_ACTIVE_KEY_ID válidos: se guarda sin contenido (NONE)',
      );
      return MessageContentPolicy.NONE;
    }
    return policy;
  }

  protect(
    content: string | undefined,
    requested?: MessageContentPolicy,
  ): IProtectedContent {
    const contentPolicy = this.resolvePolicy(requested);
    const none: IProtectedContent = {
      contentPolicy,
      contentEncrypted: null,
      contentHmac: null,
      contentExpiresAt: null,
    };
    if (content === undefined) return none;

    const contentHmac = this.canHmac
      ? hmacSha256Hex(content, this.hmacSecret)
      : null;
    if (contentPolicy !== MessageContentPolicy.AUDIT) {
      return { ...none, contentHmac };
    }

    return {
      contentPolicy,
      contentEncrypted: encryptAesGcm(content, this.keyring, this.activeKeyId),
      contentHmac,
      contentExpiresAt: new Date(
        Date.now() + this.config.messages.contentRetentionDays * DAY_MS,
      ),
    };
  }

  reveal(encrypted: string): string {
    return decryptAesGcm(encrypted, this.keyring);
  }

  /** Compara el HMAC del contenido dado con el guardado, sin revelar el contenido original. */
  verify(content: string, expectedHmac: string): boolean {
    if (!this.canHmac) {
      throw new ServiceUnavailableException(
        'HMAC_SECRET no configurado: no se puede verificar contenido.',
      );
    }
    return verifyHmacSha256(content, this.hmacSecret, expectedHmac);
  }
}
