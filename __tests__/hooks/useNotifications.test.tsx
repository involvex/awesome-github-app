import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
} from "../../src/lib/api/hooks/useNotifications";
import {
  createQueryClient,
  renderHookAndWait,
  renderHookForMutation,
} from "../test-utils/render";
import { notificationsFixture } from "../test-utils/fixtures";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

describe("useNotifications hooks", () => {
  beforeEach(() => {
    mockedGetOctokit.mockReset();
  });

  describe("useNotifications", () => {
    test("fetches notifications", async () => {
      const listNotificationsForAuthenticatedUser = jest
        .fn()
        .mockResolvedValue({ data: notificationsFixture });
      mockedGetOctokit.mockResolvedValue({
        activity: { listNotificationsForAuthenticatedUser },
      });
      const client = createQueryClient();

      const result = await renderHookAndWait(() => useNotifications(), client);

      expect(result.isSuccess).toBe(true);
      expect(result.data).toHaveLength(notificationsFixture.length);
      expect(listNotificationsForAuthenticatedUser).toHaveBeenCalledWith({
        all: true,
        per_page: 50,
      });
    });

    test("surfaces notification fetch errors", async () => {
      const error = new Error("boom");
      const listNotificationsForAuthenticatedUser = jest
        .fn()
        .mockRejectedValue(error);
      mockedGetOctokit.mockResolvedValue({
        activity: { listNotificationsForAuthenticatedUser },
      });
      const client = createQueryClient();

      const result = await renderHookAndWait(() => useNotifications(), client);

      expect(result.isError).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe("useMarkNotificationRead", () => {
    test("marks notification as read with optimistic update", async () => {
      const request = jest.fn().mockResolvedValue({});
      mockedGetOctokit.mockResolvedValue({ request });
      const client = createQueryClient();

      // Pre-populate cache
      client.setQueryData(["notifications"], notificationsFixture);

      const { result } = await renderHookForMutation(
        () => useMarkNotificationRead(),
        client,
      );

      await result.current.mutateAsync("123456789");

      expect(request).toHaveBeenCalledWith(
        "PATCH /notifications/threads/123456789",
      );
      const cached = client.getQueryData(["notifications"]);
      expect(cached).toHaveLength(2);
      expect(cached?.[0].unread).toBe(false);
      expect(cached?.[1].unread).toBe(false);
    });

    test("rolls back on error", async () => {
      const error = new Error("network error");
      const request = jest.fn().mockRejectedValue(error);
      mockedGetOctokit.mockResolvedValue({ request });
      const client = createQueryClient();

      client.setQueryData(["notifications"], notificationsFixture);

      const { result } = await renderHookForMutation(
        () => useMarkNotificationRead(),
        client,
      );

      await expect(result.current.mutateAsync("123456789")).rejects.toThrow(
        "network error",
      );

      const cached = client.getQueryData(["notifications"]);
      expect(cached?.[0].unread).toBe(true);
    });
  });

  describe("useMarkAllRead", () => {
    test("marks all notifications as read", async () => {
      const markNotificationsAsRead = jest.fn().mockResolvedValue({});
      mockedGetOctokit.mockResolvedValue({
        activity: { markNotificationsAsRead },
      });
      const client = createQueryClient();

      client.setQueryData(["notifications"], notificationsFixture);

      const { result } = await renderHookForMutation(
        () => useMarkAllRead(),
        client,
      );

      await result.current.mutateAsync();

      expect(markNotificationsAsRead).toHaveBeenCalled();
      const cached = client.getQueryData(["notifications"]);
      expect(cached?.every(n => n.unread === false)).toBe(true);
    });

    test("rolls back on error", async () => {
      const error = new Error("network error");
      const markNotificationsAsRead = jest.fn().mockRejectedValue(error);
      mockedGetOctokit.mockResolvedValue({
        activity: { markNotificationsAsRead },
      });
      const client = createQueryClient();

      client.setQueryData(["notifications"], notificationsFixture);

      const { result } = await renderHookForMutation(
        () => useMarkAllRead(),
        client,
      );

      await expect(result.current.mutateAsync()).rejects.toThrow(
        "network error",
      );

      const cached = client.getQueryData(["notifications"]);
      expect(cached?.[0].unread).toBe(true);
    });
  });
});
