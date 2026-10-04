import { StreamableFile } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { JSON_STREAM_KEY } from '@common/decorators/json-stream.constants';
import { JsonStreamInterceptor } from '@core/interceptors/json-stream.interceptor';
import { JsonStreamHelper } from './json-stream.helper';

async function collect(gen: AsyncIterable<Buffer>): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const c of gen) chunks.push(c);
  return Buffer.concat(chunks).toString('utf-8');
}

async function* numbers(n: number) {
  await Promise.resolve();
  for (let i = 1; i <= n; i++) yield { n: i };
}

describe('JsonStreamHelper', () => {
  it('concatenar los chunks reconstruye un JSON válido (pre + items + post)', async () => {
    const json = await collect(
      JsonStreamHelper.stream({
        pre: { generatedAt: 'now' },
        arrayKey: 'items',
        items: numbers(3),
        post: { extra: true },
      }),
    );

    expect(JSON.parse(json)).toEqual({
      generatedAt: 'now',
      items: [{ n: 1 }, { n: 2 }, { n: 3 }],
      extra: true,
    });
  });

  it('sin pre/post ni items produce {"items":[]}', async () => {
    const json = await collect(
      JsonStreamHelper.stream({ arrayKey: 'items', items: [] }),
    );

    expect(JSON.parse(json)).toEqual({ items: [] });
  });

  it('accumulate calcula campos post-array sin materializar los items', async () => {
    const json = await collect(
      JsonStreamHelper.stream({
        arrayKey: 'items',
        items: numbers(4),
        accumulate: {
          initial: 0,
          reduce: (acc: number, item: { n: number }) => acc + item.n,
          finalize: (sum) => ({ sum }),
        },
      }),
    );

    expect(JSON.parse(json)).toMatchObject({ sum: 10 });
  });
});

describe('JsonStreamInterceptor', () => {
  const reflector = { get: jest.fn() };
  const interceptor = new JsonStreamInterceptor(
    reflector as unknown as Reflector,
  );
  const context = { getHandler: () => 'handler' } as never;

  beforeEach(() => jest.clearAllMocks());

  it('sin la marca del decorador deja pasar el valor', async () => {
    reflector.get.mockReturnValue(undefined);
    const value = { arrayKey: 'items', items: [] };

    const result = await lastValueFrom(
      interceptor.intercept(context, { handle: () => of(value) }),
    );

    expect(reflector.get).toHaveBeenCalledWith(JSON_STREAM_KEY, 'handler');
    expect(result).toBe(value);
  });

  it('marcado pero con otra forma de valor, lo deja pasar intacto', async () => {
    reflector.get.mockReturnValue(true);

    const result = await lastValueFrom(
      interceptor.intercept(context, { handle: () => of({ ok: 1 }) }),
    );

    expect(result).toEqual({ ok: 1 });
  });

  it('marcado y con forma de documento devuelve un StreamableFile JSON', async () => {
    reflector.get.mockReturnValue(true);

    const result = await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of({ arrayKey: 'items', items: [{ a: 1 }] }),
      }),
    );

    expect(result).toBeInstanceOf(StreamableFile);
    expect((result as StreamableFile).getHeaders().type).toBe(
      'application/json',
    );
  });
});
