import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { QueryTypes } from '@sequelize/core';
import { DatabaseConnections } from '@core/database/enum/database.enum';
import { SequelizeService } from '@core/database/services/sequelize.service';

/**
 * Patrón: indicador de salud por sonda mínima. `SYSIBM.SYSDUMMY1` es la tabla de una fila de DB2
 * (el equivalente de `SELECT 1` sin FROM). Se registra solo si la conexión Sequelize está activa
 * (ver `DatabaseModule.forRoot*`); el health controller lo inyecta como opcional.
 */
@Injectable()
export class Db2HealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(DatabaseConnections.DEFAULT)
    private readonly db: SequelizeService,
  ) {}

  async check(key = 'db2'): Promise<HealthIndicatorResult> {
    const session = this.healthIndicatorService.check(key);
    try {
      const sequelize = this.db.getInstance();
      const probe =
        sequelize.dialect.name === 'ibmi'
          ? 'SELECT 1 FROM SYSIBM.SYSDUMMY1'
          : 'SELECT 1';
      await sequelize.query(probe, { type: QueryTypes.SELECT });
      return session.up();
    } catch {
      // Sin detalle del error: el healthcheck es público (inviolable: no filtrar errores DB2).
      return session.down({ message: 'DB2 no disponible' });
    }
  }
}
