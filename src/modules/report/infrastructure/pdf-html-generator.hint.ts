import * as Handlebars from 'handlebars';
import * as htmlPdf from 'html-pdf-node';
import { IReportPayload } from '../domain/types/report.type';

export class PdfHtmlGenerator {
  public static async generate(
    payload: IReportPayload,
    templateHtml: string,
  ): Promise<Buffer> {
    // 1. Compilar la plantilla inyectando metadata e items juntos
    const compiledTemplate = Handlebars.compile(templateHtml);
    const htmlContent = compiledTemplate({
      ...payload.metadata,
      items: payload.items,
    });

    // 2. Opciones de renderizado (A4 estándar sin usar Chromium pesado)
    const options = {
      format: 'A4',
      margin: { top: '8mm', right: '8mm', bottom: '8mm', left: '8mm' },
      printBackground: true,
    };

    const file = { content: htmlContent };

    return new Promise((resolve, reject) => {
      htmlPdf.generatePdf(file, options, (err, buffer) => {
        if (err)
          return reject(err instanceof Error ? err : new Error(String(err)));
        resolve(buffer);
      });
    });
  }
}
