import { of } from 'rxjs';
import { ExampleUpstreamClient } from './example-upstream.client';

const mockRequest = jest.fn();

const config = {
  upstreamExample: {
    baseUrl: 'http://upstream.test',
    timeoutMs: 500,
    authType: 'api-key',
    authUser: '',
    authSecret: 'secret',
    authHeader: 'X-Api-Key',
    retryAttempts: 0,
    retryDelayMs: 0,
  },
};

describe('ExampleUpstreamClient', () => {
  beforeEach(() => jest.clearAllMocks());

  it('usa la configuración (baseURL, timeout, api-key) para sus requests', async () => {
    mockRequest.mockReturnValue(of({ data: { url: 'x' } }));
    const client = new ExampleUpstreamClient(
      { request: mockRequest } as never,
      config as never,
    );

    const result = await client.echo({ q: '1' });

    expect(result).toEqual({ url: 'x' });
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/anything',
        baseURL: 'http://upstream.test',
        timeout: 500,
        headers: { 'X-Api-Key': 'secret' },
      }),
    );
  });

  it('submit envía un POST con el payload', async () => {
    mockRequest.mockReturnValue(of({ data: {} }));
    const client = new ExampleUpstreamClient(
      { request: mockRequest } as never,
      config as never,
    );

    await client.submit({ a: 1 });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', data: { a: 1 } }),
    );
  });
});
