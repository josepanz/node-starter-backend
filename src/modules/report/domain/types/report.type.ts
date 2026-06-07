import { TDocumentDefinitions } from 'pdfmake/interfaces';

export type IReportFormat = 'pdf' | 'xlsx' | 'csv';

export interface IExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface IReportDataMetadata {
  excelColumns?: IExcelColumn[]; // Estructura dinámica de columnas para planillas
  title?: string; // Nombre de la pestaña de Excel
  [key: string]: any; // Variables libres (ej: idLote, totalRegistros, etc.)
}

export interface IReportPayload<T = any> {
  metadata: IReportDataMetadata;
  items: T[]; // Datos crudos mapeados (filas)
}

export interface IReportOptions {
  format: IReportFormat;
  templateHtml?: string; // Requerido solo si el formato es 'pdf'
}

export type IPdfEngine = 'html' | 'native'; // <-- Añadimos esto

export interface IReportOptions {
  format: IReportFormat;
  pdfEngine?: IPdfEngine; // Opcional: por defecto puede ser 'html'
  templateHtml?: string; // Requerido si pdfEngine es 'html'
  nativeDefinition?: TDocumentDefinitions; // Requerido si pdfEngine es 'native' (Estructura pdfMake)
}
