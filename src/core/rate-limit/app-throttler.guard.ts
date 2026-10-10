import { Injectable } from '@nestjs/common';
import { BaseThrottlerGuard, isClientLimiter } from './base-throttler.guard';

/** Guard GLOBAL (APP_GUARD): limiters por IP (default/auth/upload/search); ignora el `client`. */
@Injectable()
export class AppThrottlerGuard extends BaseThrottlerGuard {
  protected handlesLimiter(name: string): boolean {
    return !isClientLimiter(name);
  }
}
