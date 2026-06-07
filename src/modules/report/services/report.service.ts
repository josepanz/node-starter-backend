import { Injectable, BadRequestException } from '@nestjs/common';
import { IReportService } from '../domain/interfaces/report.interface';
import { IReportOptions, IReportPayload } from '../domain/types/report.type';
import { ExcelGenerator } from '../infrastructure/excel-generator.hint';
import { PdfHtmlGenerator } from '../infrastructure/pdf-html-generator.hint';
import { PdfNativeGenerator } from '../infrastructure/pdf-native-generator.hint';

@Injectable()
export class ReportService implements IReportService {
  public async generate(
    payload: IReportPayload,
    options: IReportOptions,
  ): Promise<Buffer> {
    switch (options.format) {
      case 'xlsx':
        return await ExcelGenerator.generateXlsx(payload);

      case 'csv':
        return ExcelGenerator.generateCsv(payload);

      case 'pdf':
        return this.handlePdfGeneration(payload, options);

      default:
        throw new BadRequestException(
          `Formato no soportado: ${options.format as string}`,
        );
    }
  }

  private async handlePdfGeneration(
    payload: IReportPayload,
    options: IReportOptions,
  ): Promise<Buffer> {
    const engine = options.pdfEngine || 'html';

    if (engine === 'html') {
      if (!options.templateHtml) {
        throw new BadRequestException(
          'El motor HTML requiere la propiedad "templateHtml".',
        );
      }
      return await PdfHtmlGenerator.generate(payload, options.templateHtml);
    }

    if (engine === 'native') {
      if (!options.nativeDefinition) {
        throw new BadRequestException(
          'El motor Nativo requiere la propiedad "nativeDefinition".',
        );
      }
      return await PdfNativeGenerator.generate(options.nativeDefinition);
    }

    throw new BadRequestException(
      `Motor PDF "${engine as string}" no reconocido.`,
    );
  }
}
