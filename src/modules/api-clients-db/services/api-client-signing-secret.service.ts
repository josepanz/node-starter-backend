import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import {
  decryptAesGcm,
  encryptAesGcm,
  Keyring,
  parseKeyring,
} from '@common/helpers/crypto/aes-gcm.helper';

/**
 * Patrón: SRP. El signing secret HMAC debe poder leerse del lado servidor (a diferencia del
 * client secret, que solo se verifica con bcrypt), así que se guarda cifrado con AES-256-GCM
 * usando el keyring existente. Sin ENCRYPTION_KEYS el HMAC por cliente no puede habilitarse.
 */
@Injectable()
export class ApiClientSigningSecretService {
  private readonly logger = new Logger(ApiClientSigningSecretService.name);
  private readonly keyring: Keyring;
  private readonly activeKeyId: string;

  constructor(@Inject(APP_CONFIG.KEY) config: ConfigType<AppConfigType>) {
    let keyring: Keyring = new Map();
    try {
      keyring = parseKeyring(config.security.encryptionKeys);
    } catch (error) {
      this.logger.warn(
        `ENCRYPTION_KEYS inválido, el HMAC por cliente queda deshabilitado: ${error instanceof Error ? error.message : 'error'}`,
      );
    }
    this.keyring = keyring;
    this.activeKeyId = config.security.encryptionActiveKeyId;
  }

  get available(): boolean {
    return this.keyring.has(this.activeKeyId);
  }

  encrypt(secret: string): string {
    return encryptAesGcm(secret, this.keyring, this.activeKeyId);
  }

  decrypt(payload: string): string {
    return decryptAesGcm(payload, this.keyring);
  }
}
