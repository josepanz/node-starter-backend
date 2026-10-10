import { OrderNotificationsListener } from './order-notifications.listener';

const mockNotify = jest.fn();

describe('OrderNotificationsListener', () => {
  let listener: OrderNotificationsListener;

  beforeEach(() => {
    jest.clearAllMocks();
    listener = new OrderNotificationsListener({ notify: mockNotify } as never);
  });

  it('notifica al dueño con el cambio de estado', async () => {
    mockNotify.mockResolvedValue({});

    await listener.handle({
      orderReferenceId: 'ref-1',
      ownerId: 3,
      from: 'PENDING',
      to: 'CONFIRMED',
    });

    expect(mockNotify).toHaveBeenCalledWith(
      3,
      expect.objectContaining({
        body: expect.stringContaining('ref-1'),
        data: { orderReferenceId: 'ref-1', status: 'CONFIRMED' },
      }),
    );
  });

  it('un fallo de notificación no se propaga al emisor', async () => {
    mockNotify.mockRejectedValue(new Error('boom'));

    await expect(
      listener.handle({
        orderReferenceId: 'r',
        ownerId: 1,
        from: 'A',
        to: 'B',
      }),
    ).resolves.toBeUndefined();
  });
});
