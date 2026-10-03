import { NotificationsApiService } from './notifications-api.service';

const mockNotify = jest.fn();
const mockInboxList = jest.fn();
const mockMarkRead = jest.fn();
const mockCountUnread = jest.fn();
const mockRegister = jest.fn();
const mockRemove = jest.fn();

const notification = {
  referenceId: 'n-1',
  title: 't',
  body: 'b',
  data: null,
  requiresAction: false,
  readAt: null,
  createdAt: new Date(),
};

describe('NotificationsApiService', () => {
  let service: NotificationsApiService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationsApiService(
      { notify: mockNotify } as never,
      {
        list: mockInboxList,
        markRead: mockMarkRead,
        countUnread: mockCountUnread,
      } as never,
      { register: mockRegister, remove: mockRemove } as never,
    );
  });

  it('todas las operaciones usan el userId del token', async () => {
    mockInboxList.mockResolvedValue({ items: [notification], total: 1 });
    mockMarkRead.mockResolvedValue(notification);
    mockCountUnread.mockResolvedValue(2);

    await service.list(9, { page: 1, pageSize: 10, unreadOnly: true });
    await service.markRead(9, 'n-1');
    await service.unreadCount(9);
    await service.removeSubscription(9, 4);

    expect(mockInboxList).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 9, unreadOnly: true }),
    );
    expect(mockMarkRead).toHaveBeenCalledWith(9, 'n-1');
    expect(mockCountUnread).toHaveBeenCalledWith(9);
    expect(mockRemove).toHaveBeenCalledWith(9, 4);
  });

  it('registerSubscription no expone token ni claves', async () => {
    mockRegister.mockResolvedValue({
      id: 1,
      channel: 'FCM',
      token: 'secreto',
      active: true,
      createdAt: new Date(),
    });

    const result = await service.registerSubscription(9, {
      channel: 'FCM',
      token: 'secreto',
    });

    expect(result).not.toHaveProperty('token');
    expect(mockRegister).toHaveBeenCalledWith(9, expect.anything());
  });

  it('sendTest hace fan-out al propio usuario', async () => {
    mockNotify.mockResolvedValue({ notification, sent: 1, gone: 0, failed: 0 });

    const result = await service.sendTest(9);

    expect(mockNotify).toHaveBeenCalledWith(
      9,
      expect.objectContaining({ title: expect.any(String) }),
    );
    expect(result).toMatchObject({
      sent: 1,
      notification: { referenceId: 'n-1' },
    });
  });

  it('unreadCount devuelve el contador', async () => {
    mockCountUnread.mockResolvedValue(5);

    await expect(service.unreadCount(1)).resolves.toEqual({ unread: 5 });
  });
});
