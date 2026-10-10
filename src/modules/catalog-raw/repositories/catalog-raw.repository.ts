import { Inject, Injectable } from '@nestjs/common';
import { QueryTypes, Transaction } from '@sequelize/core';
import { SqlQueryHelper } from '@common/helpers/sql-query.helper';
import { DatabaseConnections } from '@core/database/enum/database.enum';
import { SequelizeService } from '@core/database/services/sequelize.service';
import { CatalogItemHelper } from '../helpers/catalog-item.helper';
import {
  CatalogItemFilterParams,
  CatalogItemQueryParams,
  ICatalogItemCreate,
  ICatalogItemRaw,
  ICatalogPriceUpdate,
  IProcedureResultRaw,
} from '../interfaces/catalog-item.interface';

/**
 * Patrón: Repository de SQL crudo (estrategia "solo raw query"). Todo el SQL se arma en el helper
 * y se ejecuta aquí con `QueryTypes` explícito. Los errores de Sequelize NO se capturan: suben al
 * `SequelizeExceptionFilter` (409/503/500 sin detalle DB2). Un spec con mocks no prueba el SQL real:
 * verificarlo contra la base antes de darlo por cerrado.
 */
@Injectable()
export class CatalogRawRepository {
  constructor(
    @Inject(DatabaseConnections.DEFAULT)
    private readonly db: SequelizeService,
  ) {}

  /**
   * Página de datos + total con los MISMOS filtros, en paralelo (2 queries; el límite sano por
   * request en IBM i es ~5-7 en `Promise.all`, si hace falta más consolidar con CTEs).
   */
  async findPage(
    params: CatalogItemQueryParams,
  ): Promise<{ rows: ICatalogItemRaw[]; total: number }> {
    const { query, replacements } = CatalogItemHelper.buildItemsQuery(params);
    const { query: countQuery, replacements: countReplacements } =
      CatalogItemHelper.buildCountQuery(this.toFilters(params));
    const sequelize = this.db.getInstance();

    const [rows, countRow] = await Promise.all([
      sequelize.query<ICatalogItemRaw>(query, {
        replacements,
        type: QueryTypes.SELECT,
      }),
      sequelize.query<{ total: string | number }>(countQuery, {
        replacements: countReplacements,
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    return { rows, total: Number(countRow?.total ?? 0) };
  }

  /** `plain: true` devuelve `T | null` (no `T`): el tipo de retorno lo declara explícito. */
  async findByCode(code: string): Promise<ICatalogItemRaw | null> {
    const { query, replacements } = CatalogItemHelper.buildItemsQuery({
      exactCode: code,
      page: 1,
      pageSize: 1,
    });
    return this.db.getInstance().query<ICatalogItemRaw>(query, {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    });
  }

  /** INSERT parametrizado. Una clave duplicada sube como SQL0803 y el filtro la traduce a 409. */
  async insertItem(
    item: ICatalogItemCreate & { createdAt: number },
    transaction?: Transaction,
  ): Promise<void> {
    await this.db.getInstance().query(
      `INSERT INTO APPLIB.ITEMS (ITMCOD, ITMDSC, ITMCAT, ITMSTS, ITMPRC, ITMFEC)
       VALUES (:code, :description, :categoryCode, 'A', :price, :createdAt)`,
      {
        replacements: { ...item },
        type: QueryTypes.INSERT,
        transaction,
      },
    );
  }

  /**
   * UPDATE masivo por códigos. `QueryTypes.BULKUPDATE` es el único tipo que en este dialecto
   * devuelve las filas afectadas como número (sin `type`, el driver devuelve `[[], []]` y
   * `Number(resultado)` da siempre 0). Un UPDATE sobre códigos inexistentes no falla: afecta 0.
   */
  async updateStatusByCodes(
    codes: string[],
    statusCode: string,
    transaction?: Transaction,
  ): Promise<number> {
    const { placeholders, replacements } = SqlQueryHelper.buildInPlaceholders(
      'codes',
      codes,
    );
    const affected = await this.db
      .getInstance()
      .query(
        `UPDATE APPLIB.ITEMS SET ITMSTS = :statusCode WHERE ITMCOD IN (${placeholders})`,
        {
          replacements: { ...replacements, statusCode },
          type: QueryTypes.BULKUPDATE,
          transaction,
        },
      );
    return Number(affected ?? 0);
  }

  /**
   * Lote vía JSON: UN parámetro JSON por `bind` + `JSON_TABLE` en el servidor, en vez de N round-trips.
   * Por qué `bind` y no `replacements`: `replacements` INTERPOLA el valor en el texto SQL y DB2 for i
   * corta con SQL0101 (sentencia demasiado larga) al pasar ~32 KB de literal; `bind` manda el valor
   * como parámetro real (CLOB) y el SQL queda chico. Se serializa solo lo que el SQL lee.
   */
  async updatePricesBatch(
    items: ICatalogPriceUpdate[],
    transaction?: Transaction,
  ): Promise<number> {
    const payload = JSON.stringify({
      items: items.map(({ code, price }) => ({ code, price })),
    });
    const affected = await this.db.getInstance().query(
      `MERGE INTO APPLIB.ITEMS T
       USING (
         SELECT J.ITMCOD, J.PRICE
         FROM JSON_TABLE($1, 'lax $.items[*]' COLUMNS (
           ITMCOD CHAR(10)      PATH '$.code',
           PRICE  DECIMAL(11,2) PATH '$.price')) AS J
       ) S ON T.ITMCOD = S.ITMCOD
       WHEN MATCHED THEN UPDATE SET T.ITMPRC = S.PRICE`,
      { bind: [payload], type: QueryTypes.BULKUPDATE, transaction },
    );
    return Number(affected ?? 0);
  }

  /**
   * Función tabular: `SELECT ... FROM TABLE(schema.FN(?))`, con `QueryTypes.SELECT` y parámetros
   * posicionales. `FN_EXAMPLE` es ficticia: ajustar al objeto real del proyecto.
   */
  async findByTableFunction(categoryCode: string): Promise<ICatalogItemRaw[]> {
    return this.db.getInstance().query<ICatalogItemRaw>(
      `SELECT
         TRIM(T.ITMCOD) AS "code",
         TRIM(T.ITMDSC) AS "description",
         TRIM(T.ITMCAT) AS "categoryCode",
         '' AS "categoryDescription",
         T.ITMSTS AS "status",
         T.ITMPRC AS "price",
         T.ITMFEC AS "createdAt"
       FROM TABLE(APPLIB.FN_EXAMPLE(?)) AS T
       ORDER BY T.ITMCOD`,
      { replacements: [categoryCode], type: QueryTypes.SELECT },
    );
  }

  /**
   * Stored procedure: `CALL schema.SP(?, ?)` con `QueryTypes.SELECT` (así el dialecto devuelve el
   * result set). Los SP NO llevan parámetros OUT: el driver ODBC no puede bindear literales en un
   * OUT y falla con SQL0469; lo que deba devolver, lo devuelve como result set `(CODE, MESSAGE)`.
   * Un SP que falla lo hace con SIGNAL (llega como excepción). `SP_EXAMPLE` es ficticio.
   *
   * COMMITMENT CONTROL: un SP `*CHG` participa de `transaction` (su COMMIT/ROLLBACK arrastra todo);
   * uno `*NONE` escribe fuera de ella y no se revierte: llamarlo post-commit y SIN `transaction`.
   */
  async callExampleProcedure(
    categoryCode: string,
    actor: string,
    transaction?: Transaction,
  ): Promise<IProcedureResultRaw[]> {
    return this.db
      .getInstance()
      .query<IProcedureResultRaw>('CALL APPLIB.SP_EXAMPLE(?, ?)', {
        replacements: [categoryCode, actor],
        type: QueryTypes.SELECT,
        transaction,
      });
  }

  private toFilters(params: CatalogItemQueryParams): CatalogItemFilterParams {
    const { code, exactCode, description, status, categoryCodes } = params;
    return { code, exactCode, description, status, categoryCodes };
  }
}
