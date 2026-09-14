import { render, waitFor } from "@testing-library/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
} from "../../src/lib/api/hooks/useNotifications";
import { notificationsFixture } from "../test-utils/fixtures";
import { createQueryClient } from "../test-utils/render";

const mockedGetOctokit = jest.fn();

jest.mock("../../src/lib/api/github", () => ({
  getOctokit: () => mockedGetOctokit(),
}));

function NotificationsConsumer({
  onState,
}: {
  onState: (state: ReturnType<typeof useNotifications>) => void;
}) {
  const state = useNotifications();
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

function MarkReadConsumer({
  onState,
}: {
  onState: (state: ReturnType<typeof useMarkNotificationRead>) => void;
}) {
  const state = useMarkNotificationRead();
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

function MarkAllReadConsumer({
  onState,
}: {
  onState: (state: ReturnType<typeof useMarkAllRead>) => void;
}) {
  const state = useMarkAllRead();
  React.useEffect(() => {
    onState(state);
  }, [state, onState]);
  return null;
}

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
      const states: ReturnType<typeof useNotifications>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <NotificationsConsumer onState={s => states.push(s)} />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(
          states.find(
            s => s.isSuccess && s.data?.length === notificationsFixture.length,
          ),
        ).toBeTruthy(),
      );
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
      const states: ReturnType<typeof useNotifications>[] = [];
      const client = createQueryClient();

      render(
        <QueryClientProvider client={client}>
          <NotificationsConsumer onState={s => states.push(s)} />
        </QueryClientProvider>,
      );

      await waitFor(() =>
        expect(states.some(s => s.isError && s.error === error)).toBe(true),
      );
    });
  });

  describe("useMarkNotificationRead", () => {
    test("marks notification as read with optimistic update", async () => {
      const request = jest.fn().mockResolvedValue({});
      mockedGetOctokit.mockResolvedValue({ request });
      const client = createQueryClient();

      // Pre-populate cache
      client.setQueryData(["notifications"], notificationsFixture);

      const { result } = renderHookWithClient(
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

      const { result } = renderHookWithClient(
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

      const { result } = renderHookWithClient(() => useMarkAllRead(), client);

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

      const { result } = renderHookWithClient(() => useMarkAllRead(), client);

      await expect(result.current.mutateAsync()).rejects.toThrow(
        "network error",
      );

      const cached = client.getQueryData(["notifications"]);
      expect(cached?.[0].unread).toBe(true);
    });
  });
});

function renderHookWithClient<T>(
  hook: () => T,
  client = createQueryClient(),
): { result: { current: T } } {
  const result: { current: T | undefined } = { current: undefined };
  const Test = () => {
    result.current = hook();
    return null;
  };
  render(
    <QueryClientProvider client={client}>
      <Test />
    </QueryClientProvider>,
  );
  return { result: { current: result.current! } };
}
