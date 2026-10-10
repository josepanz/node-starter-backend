import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from '@core/database/database.module';
import { ApiClientsDBService } from './services/api-clients-db.service';
import { ApiClientSigningSecretService } from './services/api-client-signing-secret.service';

// Global: los guards (BasicAuthGuard/HmacSignatureGuard) se instancian en el módulo del controller
// que los usa y necesitan el servicio sin que cada módulo API tenga que importarlo.
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [ApiClientsDBService, ApiClientSigningSecretService],
  exports: [ApiClientsDBService],
})
export class ApiClientsDBModule {}
