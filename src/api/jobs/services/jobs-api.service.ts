import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BackgroundJobsDBService } from '@modules/jobs-db/services/background-jobs-db.service';
import { JobHandlerRegistry } from '@modules/jobs/services/job-handler.registry';
import { EnqueueJobRequestDTO } from '../dtos/enqueue-job.request.dto';
import { JobResponseDTO } from '../dtos/job.response.dto';

/** Capa API: valida el type/payload contra el handler y delega la cola en `jobs-db`. */
@Injectable()
export class JobsApiService {
  constructor(
    private readonly jobs: BackgroundJobsDBService,
    private readonly registry: JobHandlerRegistry,
  ) {}

  listTypes(): { types: string[] } {
    return { types: this.registry.getTypes() };
  }

  async enqueue(
    dto: EnqueueJobRequestDTO,
    userId: number,
  ): Promise<JobResponseDTO> {
    const handler = this.registry.resolve(dto.type);
    handler.validatePayload?.(dto.payload ?? {});

    const job = await this.jobs.enqueue({
      type: dto.type,
      payload: (dto.payload ?? {}) as Prisma.InputJsonObject,
      maxAttempts: dto.maxAttempts,
      createdBy: userId,
    });
    return JobResponseDTO.fromEntity(job);
  }

  async findOne(referenceId: string): Promise<JobResponseDTO> {
    const job = await this.jobs.findByReference(referenceId);
    if (!job) throw new NotFoundException('Job no encontrado.');
    return JobResponseDTO.fromEntity(job);
  }

  async requeue(referenceId: string): Promise<JobResponseDTO> {
    const requeued = await this.jobs.requeue(referenceId);
    if (!requeued) {
      await this.findOne(referenceId); // 404 si no existe
      throw new ConflictException('Solo se pueden reencolar jobs en FAILED.');
    }
    return this.findOne(referenceId);
  }
}
