/**
 * Acumulador opcional para campos "post-array" que solo se conocen tras
 * iterar todo `items` (cuando no hay un agregado barato precalculado, ver
 * `IJsonStreamDocument.post` para el caso en que sí lo hay).
 */
export interface IJsonStreamAccumulator<TItem, TAcc> {
  /** Valor inicial del acumulador, antes de procesar el primer ítem. */
  initial: TAcc;
  /** Combina el acumulador actual con un ítem recién emitido. */
  reduce: (acc: TAcc, item: TItem) => TAcc;
  /** Convierte el acumulador final en los campos JSON a emitir después del array. */
  finalize: (acc: TAcc) => Record<string, unknown>;
}

/**
 * Documento JSON a transmitir en 3 fases: campos conocidos antes del array
 * (`pre`), el array en sí (`arrayKey`/`items`) y campos conocidos después del
 * array (`post`, o derivados de `accumulate` si no hay un agregado barato
 * disponible de antemano). `items` puede ser un array ya materializado o un
 * `AsyncIterable`/`Iterable` que lo produce de a uno, sin mantenerlo completo
 * en memoria — pensado para ser reusado por cualquier endpoint que necesite
 * responder JSON chunked.
 */
export interface IJsonStreamDocument<TItem, TAcc = unknown> {
  pre?: Record<string, unknown>;
  arrayKey: string;
  items: Iterable<TItem> | AsyncIterable<TItem>;
  post?: Record<string, unknown>;
  accumulate?: IJsonStreamAccumulator<TItem, TAcc>;
}

export class JsonStreamHelper {
  /**
   * Genera los `Buffer` de un `IJsonStreamDocument` en 3 fases (pre, array,
   * post) sin materializar el array completo en memoria cuando `doc.items`
   * es un `Iterable`/`AsyncIterable` perezoso — concatenar todos los `Buffer`
   * emitidos en orden reconstruye un único JSON válido.
   * @param doc Documento a transmitir
   * @returns Generador asíncrono de `Buffer`, listo para `Readable.from(...)`
   */
  static async *stream<TItem, TAcc = unknown>(
    doc: IJsonStreamDocument<TItem, TAcc>,
  ): AsyncGenerator<Buffer, void, void> {
    yield this.openPre(doc.pre);
    yield Buffer.from(`"${doc.arrayKey}":[`, 'utf-8');

    let acc = doc.accumulate?.initial as TAcc;
    let isFirst = true;
    for await (const item of doc.items) {
      if (doc.accumulate) {
        acc = doc.accumulate.reduce(acc, item);
      }
      yield Buffer.from(
        `${isFirst ? '' : ','}${JSON.stringify(item)}`,
        'utf-8',
      );
      isFirst = false;
    }

    yield Buffer.from(']', 'utf-8');
    yield this.closePost(doc.post, doc.accumulate?.finalize(acc));
  }

  /**
   * Arma el `Buffer` de apertura: `{` solo (sin campos previos) o
   * `{...pre,` (con la coma que encadena con el array que sigue).
   * @param pre Campos conocidos de antemano, o `undefined`
   * @returns `Buffer` de apertura del documento
   */
  private static openPre(pre?: Record<string, unknown>): Buffer {
    const keys = Object.keys(pre ?? {});
    if (keys.length === 0) {
      return Buffer.from('{', 'utf-8');
    }
    return Buffer.from(`${JSON.stringify(pre).slice(0, -1)},`, 'utf-8');
  }

  /**
   * Arma el `Buffer` de cierre: `}` solo (sin campos posteriores) o
   * `,...post}` (con la coma que encadena con el array recién cerrado).
   * @param post Campos conocidos de antemano, o `undefined`
   * @param accResult Campos derivados de `accumulate.finalize`, o `undefined`
   * @returns `Buffer` de cierre del documento
   */
  private static closePost(
    post?: Record<string, unknown>,
    accResult?: Record<string, unknown>,
  ): Buffer {
    const merged = { ...(post ?? {}), ...(accResult ?? {}) };
    const keys = Object.keys(merged);
    if (keys.length === 0) {
      return Buffer.from('}', 'utf-8');
    }
    return Buffer.from(`,${JSON.stringify(merged).slice(1)}`, 'utf-8');
  }
}
