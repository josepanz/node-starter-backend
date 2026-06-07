export interface RetryOptions {
  attempts: number;
  delayMs: number;
  shouldRetry?: (error: any) => boolean;
}
