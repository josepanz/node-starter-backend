import * as ExcelJS from 'exceljs';
import { PassThrough } from 'stream';
import { IReportPayload, IExcelColumn } from '../domain/types/report.type';

export class ExcelGenerator {
  public static async generateXlsx(payload: IReportPayload): Promise<Buffer> {
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    // Collect stream data before writing to avoid race conditions
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream });
    const worksheet = workbook.addWorksheet(
      payload.metadata.title || 'Reporte',
    );

    const columns: IExcelColumn[] = payload.metadata.excelColumns || [];
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1F2937' },
      };
    });
    headerRow.commit();

    for (const item of payload.items) {
      worksheet.addRow(item).commit();
    }

    await workbook.commit();
    return bufferPromise;
  }

  public static generateCsv(payload: IReportPayload): Buffer {
    const columns: IExcelColumn[] = payload.metadata.excelColumns || [];
    const keys = columns.map((c) => c.key);

    const escape = (val: unknown): string => {
      if (val === null || val === undefined) return '';
      if (
        typeof val !== 'string' &&
        typeof val !== 'number' &&
        typeof val !== 'boolean'
      )
        return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    };

    const header = columns.map((c) => escape(c.header)).join(',');
    const rows = payload.items.map((item) =>
      keys.map((k) => escape((item as Record<string, unknown>)[k])).join(','),
    );

    return Buffer.from('﻿' + [header, ...rows].join('\r\n'), 'utf-8');
  }
}
