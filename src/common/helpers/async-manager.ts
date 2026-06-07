import { RetryOptions } from '@common/interfaces/async-retry-options.interface';

export class AsyncManager {
  private running = 0;
  private queue: Array<() => Promise<void>> = [];

  constructor(private readonly concurrency: number) {}

  async enqueue<T>(
    taskFactory: () => Promise<T>,
    retryOptions?: RetryOptions,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const taskWrapper = async () => {
        try {
          const result = await this.runWithRetry(taskFactory, retryOptions);
          resolve(result);
        } catch (error: unknown) {
          // SOLUCIÓN AL ERROR DE ESLINT:
          // Nos aseguramos de que el motivo del rechazo sea un objeto Error.
          if (error instanceof Error) {
            reject(error);
          } else {
            // Si por alguna razón lo que se lanzó no es un Error (ej: throw "string"),
            // lo envolvemos en uno para que el linter esté feliz y tengamos stack trace.
            reject(new Error(String(error)));
          }
        }
      };

      this.queue.push(taskWrapper);
      this.next();
    });
  }

  private async runWithRetry<T>(
    taskFactory: () => Promise<T>,
    retryOptions?: RetryOptions,
    currentAttempt = 0,
  ): Promise<T> {
    try {
      return await taskFactory();
    } catch (error: unknown) {
      const { attempts = 0, delayMs = 1000, shouldRetry } = retryOptions || {};

      const canRetry = currentAttempt < attempts;
      const isRetryableError = shouldRetry ? shouldRetry(error) : true;

      if (canRetry && isRetryableError) {
        const waitTime = delayMs * (currentAttempt + 1);
        await new Promise((res) => setTimeout(res, waitTime));

        return this.runWithRetry(taskFactory, retryOptions, currentAttempt + 1);
      }

      throw error;
    }
  }

  private next(): void {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        this.running++;
        task().finally(() => {
          this.running--;
          this.next();
        });
      }
    }
  }
}
