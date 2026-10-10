import { Injectable } from '@nestjs/common';
import { ApiClientsDBService } from '@modules/api-clients-db/services/api-clients-db.service';
import type { IApiClientSecrets } from '@modules/api-clients-db/interfaces/api-client.interface';
import type { IApiClientDetail } from '@modules/api-clients-db/interfaces/api-client.interface';
import {
  CreateApiClientRequestDTO,
  ListApiClientsRequestDTO,
  UpdateApiClientSettingsRequestDTO,
  UpdateApiClientStatusRequestDTO,
} from '../dtos/api-clients.request.dto';
import {
  ApiClientResponseDTO,
  ApiClientsListResponseDTO,
  ApiClientWithSecretsResponseDTO,
} from '../dtos/api-clients.response.dto';

/**
 * Capa API: orquesta DTO <-> dominio y agrega el operador (auditoría). Las reglas (hash, rotación,
 * HMAC) viven en `modules/api-clients-db`.
 */
@Injectable()
export class ApiClientsApiService {
  constructor(private readonly apiClientsDB: ApiClientsDBService) {}

  async create(
    dto: CreateApiClientRequestDTO,
    operator: string,
  ): Promise<ApiClientWithSecretsResponseDTO> {
    return this.withSecrets(
      await this.apiClientsDB.create({ ...dto, createdBy: operator }),
    );
  }

  async list(
    query: ListApiClientsRequestDTO,
  ): Promise<ApiClientsListResponseDTO> {
    const { items, total } = await this.apiClientsDB.findAllPaged(query);
    return {
      data: items.map((item) => this.toResponse(item)),
      pagination: {
        total,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(total / query.pageSize),
      },
    };
  }

  async findOne(referenceId: string): Promise<ApiClientResponseDTO> {
    return this.toResponse(await this.apiClientsDB.findOne(referenceId));
  }

  async toggleStatus(
    referenceId: string,
    dto: UpdateApiClientStatusRequestDTO,
    operator: string,
  ): Promise<ApiClientResponseDTO> {
    return this.toResponse(
      await this.apiClientsDB.toggleStatus(
        referenceId,
        dto.status,
        dto.changedReason,
        operator,
      ),
    );
  }

  async regenerateSecret(
    referenceId: string,
    operator: string,
  ): Promise<ApiClientWithSecretsResponseDTO> {
    return this.withSecrets(
      await this.apiClientsDB.regenerateSecret(referenceId, operator),
    );
  }

  async updateSettings(
    referenceId: string,
    dto: UpdateApiClientSettingsRequestDTO,
    operator: string,
  ): Promise<ApiClientWithSecretsResponseDTO> {
    return this.withSecrets(
      await this.apiClientsDB.updateSettings(referenceId, {
        ...dto,
        operator,
      }),
    );
  }

  private toResponse(detail: IApiClientDetail): ApiClientResponseDTO {
    return { ...detail };
  }

  private withSecrets(
    result: { client: IApiClientDetail } & IApiClientSecrets,
  ): ApiClientWithSecretsResponseDTO {
    return {
      client: this.toResponse(result.client),
      clientSecret: result.clientSecret,
      signingSecret: result.signingSecret,
    };
  }
}
