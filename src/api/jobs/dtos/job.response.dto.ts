import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BackgroundJob, BackgroundJobStatus } from '@prisma/client';

export class JobResponseDTO {
  @ApiProperty({ example: '3f1c9a52-0f3e-4d57-9c1e-6a0b8f2f7a10' })
  referenceId!: string;

  @ApiProperty({ example: 'report.export' })
  type!: string;

  @ApiProperty({ enum: BackgroundJobStatus })
  status!: BackgroundJobStatus;

  @ApiProperty({ example: 0 })
  attempts!: number;

  @ApiProperty({ example: 3 })
  maxAttempts!: number;

  @ApiProperty()
  nextRunAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  lastError!: string | null;

  @ApiPropertyOptional({ nullable: true, type: Object })
  result!: unknown;

  @ApiPropertyOptional({ nullable: true })
  finishedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  static fromEntity(job: BackgroundJob): JobResponseDTO {
    return {
      referenceId: job.referenceId,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      nextRunAt: job.nextRunAt,
      lastError: job.lastError,
      result: job.result,
      finishedAt: job.finishedAt,
      createdAt: job.createdAt,
    };
  }
}
