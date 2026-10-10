import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ApiClientCredential, ApiClientStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaDatasource } from '@core/database/services/prisma.service';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ApiClientsDBHelper } from '../helpers/api-clients-db.helper';
import { ApiClientSigningSecretService } from './api-client-signing-secret.service';
import type {
  ApiClientVerification,
  IApiClientDetail,
  IApiClientSecrets,
  ICreateApiClientData,
  IListApiClientsQuery,
  IUpdateApiClientSettingsData,
} from '../interfaces/api-client.interface';

const CLIENT_ID_BYTES = 9;
const SECRET_BYTES = 32;
/** `lastUsedAt` se refresca como máximo una vez por ventana para no escribir en cada request. */
const LAST_USED_REFRESH_MS = 60_000;

/**
 * Capa de dominio de credenciales M2M. Reglas: el secret solo existe en claro al crearlo/rotarlo
 * (en DB queda su hash bcrypt); rotar sobrescribe el hash, así que el secret anterior deja de
 * valer de inmediato; el HMAC por cliente exige keyring de cifrado para guardar su signing secret.
 */
@Injectable()
export class ApiClientsDBService {
  private readonly logger = new Logger(ApiClientsDBService.name);
  /** Hash descartable para igualar el costo de bcrypt cuando el clientId no existe (anti-timing). */
  private dummyHash?: Promise<string>;

  constructor(
    private readonly prisma: PrismaDatasource,
    private readonly signingSecrets: ApiClientSigningSecretService,
    @Inject(APP_CONFIG.KEY) private readonly config: ConfigType<AppConfigType>,
  ) {}

  // ─── Admin ───────────────────────────────────────────────────────────────

  async create(
    data: ICreateApiClientData,
  ): Promise<{ client: IApiClientDetail } & IApiClientSecrets> {
    if (data.hmacEnabled) this.assertHmacAvailable();

    const clientId = `cli_${randomBytes(CLIENT_ID_BYTES).toString('hex')}`;
    const clientSecret = this.generateSecret();
    const signingSecret = data.hmacEnabled ? this.generateSecret() : undefined;

    const row = await this.prisma.extended.apiClientCredential.create({
      data: {
        clientId,
        clientName: data.clientName,
        secretHash: await this.hash(clientSecret),
        scopes: data.scopes,
        rateLimitPerMinute: data.rateLimitPerMinute,
        allowedIps: data.allowedIps ?? [],
        hmacEnabled: !!data.hmacEnabled,
        signingSecretEnc: signingSecret
          ? this.signingSecrets.encrypt(signingSecret)
          : null,
        createdBy: data.createdBy,
        secretRotatedAt: new Date(),
      },
    });

    this.logger.log(`Credencial API creada: ${clientId}`);
    return {
      client: ApiClientsDBHelper.toDetail(row),
      clientSecret,
      signingSecret,
    };
  }

  async findAllPaged(
    query: IListApiClientsQuery,
  ): Promise<{ items: IApiClientDetail[]; total: number }> {
    const where: Prisma.ApiClientCredentialWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { clientId: { contains: query.search, mode: 'insensitive' } },
              { clientName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [rows, total] = await this.prisma.extended.$transaction([
      this.prisma.extended.apiClientCredential.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.extended.apiClientCredential.count({ where }),
    ]);
    return {
      items: rows.map((row) => ApiClientsDBHelper.toDetail(row)),
      total,
    };
  }

  async findOne(referenceId: string): Promise<IApiClientDetail> {
    return ApiClientsDBHelper.toDetail(await this.getRow(referenceId));
  }

  async toggleStatus(
    referenceId: string,
    status: ApiClientStatus,
    changedReason: string,
    operator?: string,
  ): Promise<IApiClientDetail> {
    if (!changedReason?.trim()) {
      throw new BadRequestException('changedReason es obligatorio.');
    }
    await this.getRow(referenceId);
    const row = await this.prisma.extended.apiClientCredential.update({
      where: { referenceId },
      data: {
        status,
        changedReason,
        lastChangedBy: operator,
        lastChangedAt: new Date(),
      },
    });
    return ApiClientsDBHelper.toDetail(row);
  }

  /** Rota client secret (y signing secret si HMAC está activo). Solo para credenciales ACTIVE. */
  async regenerateSecret(
    referenceId: string,
    operator?: string,
  ): Promise<{ client: IApiClientDetail } & IApiClientSecrets> {
    const current = await this.getRow(referenceId);
    if (current.status !== ApiClientStatus.ACTIVE) {
      throw new ConflictException(
        'La credencial está inactiva. Reactivala antes de regenerar el secret.',
      );
    }
    if (current.hmacEnabled) this.assertHmacAvailable();

    const clientSecret = this.generateSecret();
    const signingSecret = current.hmacEnabled
      ? this.generateSecret()
      : undefined;

    const now = new Date();
    const row = await this.prisma.extended.apiClientCredential.update({
      where: { referenceId },
      data: {
        secretHash: await this.hash(clientSecret),
        ...(signingSecret
          ? { signingSecretEnc: this.signingSecrets.encrypt(signingSecret) }
          : {}),
        secretRotatedAt: now,
        lastChangedBy: operator,
        lastChangedAt: now,
        changedReason: 'Rotación de secret',
      },
    });
    return {
      client: ApiClientsDBHelper.toDetail(row),
      clientSecret,
      signingSecret,
    };
  }

  /** Actualiza settings. Si activa HMAC devuelve el signing secret generado (única vez). */
  async updateSettings(
    referenceId: string,
    data: IUpdateApiClientSettingsData,
  ): Promise<{ client: IApiClientDetail } & IApiClientSecrets> {
    const current = await this.getRow(referenceId);

    let signingSecret: string | undefined;
    let signingSecretEnc: string | null | undefined;
    if (data.hmacEnabled === true && !current.hmacEnabled) {
      this.assertHmacAvailable();
      signingSecret = this.generateSecret();
      signingSecretEnc = this.signingSecrets.encrypt(signingSecret);
    } else if (data.hmacEnabled === false && current.hmacEnabled) {
      signingSecretEnc = null;
    }

    const row = await this.prisma.extended.apiClientCredential.update({
      where: { referenceId },
      data: {
        clientName: data.clientName,
        scopes: data.scopes,
        rateLimitPerMinute: data.rateLimitPerMinute,
        allowedIps: data.allowedIps,
        hmacEnabled: data.hmacEnabled,
        signingSecretEnc,
        changedReason: data.changedReason ?? 'Actualización de settings',
        lastChangedBy: data.operator,
        lastChangedAt: new Date(),
      },
    });
    return { client: ApiClientsDBHelper.toDetail(row), signingSecret };
  }

  // ─── Runtime (guards) ────────────────────────────────────────────────────

  /**
   * Verifica clientId + secret. Siempre ejecuta un `bcrypt.compare` (contra un hash descartable
   * si el cliente no existe) para no revelar por timing qué clientIds existen. El estado se
   * evalúa DESPUÉS de validar el secret: un tercero sin secreto no puede saber si está inactivo.
   */
  async verifyCredentials(
    clientId: string,
    secret: string,
  ): Promise<ApiClientVerification> {
    const row = await this.prisma.extended.apiClientCredential.findUnique({
      where: { clientId },
    });
    const valid = await bcrypt.compare(
      secret,
      row?.secretHash ?? (await this.getDummyHash()),
    );
    if (!row || !valid) return { result: 'invalid' };
    if (row.status !== ApiClientStatus.ACTIVE) {
      return { result: 'inactive', clientId };
    }
    this.touchLastUsed(row);
    return { result: 'ok', principal: ApiClientsDBHelper.toPrincipal(row) };
  }

  /** Signing secret en claro de un cliente con HMAC habilitado; `null` si no aplica. */
  async getSigningSecret(clientId: string): Promise<string | null> {
    const row = await this.prisma.extended.apiClientCredential.findUnique({
      where: { clientId },
      select: { hmacEnabled: true, signingSecretEnc: true },
    });
    if (!row?.hmacEnabled || !row.signingSecretEnc) return null;
    return this.signingSecrets.decrypt(row.signingSecretEnc);
  }

  // ─── Internos ────────────────────────────────────────────────────────────

  private touchLastUsed(row: ApiClientCredential): void {
    const now = Date.now();
    if (
      row.lastUsedAt &&
      now - row.lastUsedAt.getTime() < LAST_USED_REFRESH_MS
    ) {
      return;
    }
    // Fire-and-forget: telemetría de uso, no debe demorar ni romper la autenticación.
    void this.prisma.extended.apiClientCredential
      .update({ where: { id: row.id }, data: { lastUsedAt: new Date(now) } })
      .catch((error: unknown) =>
        this.logger.warn(
          `No se pudo actualizar lastUsedAt de ${row.clientId}: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
  }

  private async getRow(referenceId: string): Promise<ApiClientCredential> {
    const row = await this.prisma.extended.apiClientCredential.findUnique({
      where: { referenceId },
    });
    if (!row) throw new NotFoundException('Credencial de API no encontrada.');
    return row;
  }

  private assertHmacAvailable(): void {
    if (!this.signingSecrets.available) {
      throw new ConflictException(
        'El HMAC por cliente requiere ENCRYPTION_KEYS y ENCRYPTION_ACTIVE_KEY_ID configurados.',
      );
    }
  }

  private generateSecret(): string {
    return randomBytes(SECRET_BYTES).toString('base64url');
  }

  private async hash(secret: string): Promise<string> {
    return await bcrypt.hash(secret, this.config.apiClients.bcryptRounds);
  }

  private getDummyHash(): Promise<string> {
    const hash: Promise<string> =
      this.dummyHash ?? this.hash(randomBytes(SECRET_BYTES).toString('hex'));
    this.dummyHash = hash;
    return hash;
  }
}
