import { Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { RequiresActiveConsentGuard } from './guards/requires-active-consent.guard';
import { DataRetentionDBService } from './services/data-retention-db.service';
import { LegalDocumentsDBService } from './services/legal-documents-db.service';
import { UserConsentsDBService } from './services/user-consents-db.service';

/** Importar en cada módulo cuyos controllers usen `@RequiresActiveConsent` (resuelve el guard). */
@Module({
  imports: [DatabaseModule],
  providers: [
    LegalDocumentsDBService,
    UserConsentsDBService,
    DataRetentionDBService,
    RequiresActiveConsentGuard,
  ],
  exports: [
    LegalDocumentsDBService,
    UserConsentsDBService,
    DataRetentionDBService,
    RequiresActiveConsentGuard,
  ],
})
export class LegalDBModule {}
