import { Module } from '@nestjs/common';
import { ReportService } from './services/report.service';

@Module({
  providers: [ReportService],
  exports: [ReportService], // Esencial para inyectarlo en otros módulos
})
export class ReportModule {}
