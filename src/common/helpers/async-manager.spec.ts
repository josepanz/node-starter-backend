import { AsyncManager } from './async-manager';

describe('AsyncManager', () => {
  it('resuelve el resultado de la tarea', async () => {
    const manager = new AsyncManager(2);
    await expect(manager.enqueue(() => Promise.resolve(42))).resolves.toBe(42);
  });

  it('respeta el límite de concurrencia', async () => {
    const manager = new AsyncManager(2);
    let inFlight = 0;
    let max = 0;
    const task = async () => {
      inFlight += 1;
      max = Math.max(max, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight -= 1;
    };
    await Promise.all(Array.from({ length: 6 }, () => manager.enqueue(task)));
    expect(max).toBe(2);
  });

  it('reintenta hasta tener éxito', async () => {
    const manager = new AsyncManager(1);
    const task = jest
      .fn()
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValueOnce('ok');
    await expect(
      manager.enqueue(task, { attempts: 2, delayMs: 1 }),
    ).resolves.toBe('ok');
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('agota los reintentos y rechaza con el último error', async () => {
    const manager = new AsyncManager(1);
    const task = jest.fn().mockRejectedValue(new Error('siempre'));
    await expect(
      manager.enqueue(task, { attempts: 2, delayMs: 1 }),
    ).rejects.toThrow('siempre');
    expect(task).toHaveBeenCalledTimes(3);
  });

  it('no reintenta si shouldRetry devuelve false', async () => {
    const manager = new AsyncManager(1);
    const task = jest.fn().mockRejectedValue(new Error('fatal'));
    await expect(
      manager.enqueue(task, {
        attempts: 5,
        delayMs: 1,
        shouldRetry: () => false,
      }),
    ).rejects.toThrow('fatal');
    expect(task).toHaveBeenCalledTimes(1);
  });

  it('envuelve rechazos que no son Error', async () => {
    const manager = new AsyncManager(1);
    await expect(
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      manager.enqueue(() => Promise.reject('texto')),
    ).rejects.toThrow('texto');
  });

  it('un fallo no bloquea las tareas siguientes de la cola', async () => {
    const manager = new AsyncManager(1);
    const failing = manager.enqueue(() => Promise.reject(new Error('x')));
    const next = manager.enqueue(() => Promise.resolve('siguiente'));
    await expect(failing).rejects.toThrow('x');
    await expect(next).resolves.toBe('siguiente');
  });
});
