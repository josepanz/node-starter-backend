import { Buffer } from 'buffer';
import pdfmake from 'pdfmake';
import type {
  TDocumentDefinitions,
  TFontFamilyTypes,
} from 'pdfmake/interfaces';

const BUILT_IN_FONTS: Record<string, TFontFamilyTypes> = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
};

pdfmake.addFonts(BUILT_IN_FONTS);
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy(() => true);

export class PdfNativeGenerator {
  static async generate(definition: TDocumentDefinitions): Promise<Buffer> {
    return pdfmake.createPdf(definition).getBuffer();
  }
}
