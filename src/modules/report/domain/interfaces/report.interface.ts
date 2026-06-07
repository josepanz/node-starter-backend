import { IReportOptions, IReportPayload } from '../types/report.type';

export interface IReportService {
  generate(payload: IReportPayload, options: IReportOptions): Promise<Buffer>;
}
