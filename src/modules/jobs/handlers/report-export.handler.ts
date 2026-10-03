import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { StorageService } from '@modules/storage/services/storage.service';
import { IJobContext, IJobHandler } from '../interfaces/job-handler.interface';
import { NonRetryableJobError } from '../errors/non-retryable-job.error';

export const REPORT_EXPORT_JOB_TYPE = 'report.export';
const MAX_ROWS = 1000;
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

interface IReportExportPayload {
  title: string;
  rows: number;
}

/**
 * Handler DEMO (Strategy): genera un Excel chico con exceljs. Si el storage S3 está configurado lo
 * sube y devuelve key/bucket; si no, devuelve el archivo en base64 dentro de `result` (por eso el
 * tope de filas). Es el modelo a copiar para un export real: payload validado + artefacto + result.
 */
@Injectable()
export class ReportExportHandler implements IJobHandler {
  readonly type = REPORT_EXPORT_JOB_TYPE;
  private readonly logger = new Logger(ReportExportHandler.name);

  constructor(
    private readonly storage: StorageService,
    @Inject(APP_CONFIG.KEY)
    private readonly config: ConfigType<AppConfigType>,
  ) {}

  validatePayload(payload: unknown): void {
    const parsed = this.parse(payload);
    if (typeof parsed === 'string') throw new BadRequestException(parsed);
  }

  async handle(job: IJobContext): Promise<Prisma.InputJsonValue> {
    const parsed = this.parse(job.payload);
    if (typeof parsed === 'string') throw new NonRetryableJobError(parsed);

    const buffer = await this.buildWorkbook(parsed);
    const fileName = `report-${job.referenceId}.xlsx`;

    if (!this.isStorageConfigured()) {
      this.logger.log(`Storage no configurado: ${fileName} va en el result`);
      return {
        fileName,
        rows: parsed.rows,
        storage: null,
        contentBase64: buffer.toString('base64'),
      };
    }

    const [uploaded] = await this.storage.uploadFilesBatch([
      {
        file: {
          buffer,
          originalname: fileName,
          mimetype: XLSX_MIME,
        } as Express.Multer.File,
        path: 'exports',
        fileName,
        contentType: XLSX_MIME,
      },
    ]);
    return {
      fileName,
      rows: parsed.rows,
      storage: { key: uploaded.key, bucket: uploaded.bucket },
    };
  }

  private parse(payload: unknown): IReportExportPayload | string {
    const source =
      typeof payload === 'object' && payload !== null
        ? (payload as Record<string, unknown>)
        : {};
    const title = source.title ?? 'Reporte demo';
    const rows = source.rows ?? 10;

    if (typeof title !== 'string' || title.length === 0 || title.length > 100) {
      return 'title debe ser un texto de 1 a 100 caracteres';
    }
    if (
      !Number.isInteger(rows) ||
      (rows as number) < 1 ||
      (rows as number) > MAX_ROWS
    ) {
      return `rows debe ser un entero entre 1 y ${MAX_ROWS}`;
    }
    return { title, rows: rows as number };
  }

  private async buildWorkbook(payload: IReportExportPayload): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(payload.title.slice(0, 31));
    sheet.columns = [
      { header: 'N°', key: 'n', width: 8 },
      { header: 'Descripción', key: 'description', width: 30 },
      { header: 'Fecha', key: 'date', width: 22 },
    ];
    sheet.getRow(1).font = { bold: true };

    const now = new Date().toISOString();
    for (let i = 1; i <= payload.rows; i++) {
      sheet.addRow({ n: i, description: `Fila de ejemplo ${i}`, date: now });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private isStorageConfigured(): boolean {
    const { bucketName, accessKeyId, secretAccessKey, region } = this.config.s3;
    return Boolean(bucketName && accessKeyId && secretAccessKey && region);
  }
}
