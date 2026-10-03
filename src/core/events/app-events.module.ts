import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

/**
 * Patrón: Observer (bus in-process con `@nestjs/event-emitter`), registrado una vez y global para
 * que cualquier módulo inyecte `EventEmitter2` o declare `@OnEvent`. Ver `common/events/domain-events.ts`.
 * Los listeners async no bloquean al emisor y sus errores se suprimen (un consumidor roto no tumba la operación).
 */
@Global()
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: false, maxListeners: 20 })],
  exports: [EventEmitterModule],
})
export class AppEventsModule {}
