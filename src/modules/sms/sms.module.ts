import { Logger, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { APP_CONFIG, AppConfigType } from '@core/config/config-loader';
import { ConsoleSmsSender } from './adapters/console-sms.sender';
import { InfobipGateway } from './adapters/infobip.gateway';
import {
  InfobipLogsSource,
  InfobipReportsSource,
} from './adapters/infobip-delivery.source';
import { InfobipSmsSender } from './adapters/infobip-sms.sender';
import {
  IDeliveryStatusSource,
  SMS_DELIVERY_SOURCE,
} from './interfaces/delivery-status-source.interface';
import { ISmsSender, SMS_SENDER } from './interfaces/sms-sender.interface';

const INFOBIP_GATEWAY = Symbol('INFOBIP_GATEWAY');
type AppConfig = ConfigType<AppConfigType>;
const logger = new Logger('SmsModule');

/**
 * Patrón: Factory por configuración. `SMS_PROVIDER=infobip` con credenciales completas usa
 * Infobip; cualquier otro caso (o credenciales faltantes) cae a `ConsoleSmsSender`, así la app
 * arranca y el flujo se puede probar sin proveedor.
 */
@Module({
  providers: [
    {
      provide: INFOBIP_GATEWAY,
      inject: [APP_CONFIG.KEY],
      useFactory: (config: AppConfig): InfobipGateway | null => {
        const { provider, infobipBaseUrl, infobipApiKey, timeoutMs } =
          config.sms;
        if (provider !== 'infobip') return null;
        if (!infobipBaseUrl || !infobipApiKey) {
          logger.warn(
            'SMS_PROVIDER=infobip sin INFOBIP_BASE_URL/INFOBIP_API_KEY: se usa el sender de consola',
          );
          return null;
        }
        return new InfobipGateway({
          baseUrl: infobipBaseUrl,
          apiKey: infobipApiKey,
          timeoutMs,
        });
      },
    },
    {
      provide: SMS_SENDER,
      inject: [INFOBIP_GATEWAY, APP_CONFIG.KEY],
      useFactory: (
        gateway: InfobipGateway | null,
        config: AppConfig,
      ): ISmsSender =>
        gateway
          ? new InfobipSmsSender(gateway, config.sms.from || undefined)
          : new ConsoleSmsSender(),
    },
    {
      provide: SMS_DELIVERY_SOURCE,
      inject: [INFOBIP_GATEWAY, APP_CONFIG.KEY],
      useFactory: (
        gateway: InfobipGateway | null,
        config: AppConfig,
      ): IDeliveryStatusSource | null => {
        const { deliverySource, deliveryPollLimit } = config.sms;
        if (deliverySource === 'off') return null;
        if (!gateway) {
          logger.warn(
            `SMS_DELIVERY_SOURCE=${deliverySource} requiere Infobip configurado: seguimiento de entrega deshabilitado`,
          );
          return null;
        }
        return deliverySource === 'reports'
          ? new InfobipReportsSource(gateway, deliveryPollLimit)
          : new InfobipLogsSource(gateway);
      },
    },
  ],
  exports: [SMS_SENDER, SMS_DELIVERY_SOURCE],
})
export class SmsModule {}
