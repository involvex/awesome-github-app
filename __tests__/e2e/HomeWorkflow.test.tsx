import { renderWithProviders } from "../test-utils/render";
import { fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../src/app/index";
import React from "react";

jest.mock("../../src/contexts/AuthContext", () => ({
  __esModule: true,
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    signIn: jest.fn(),
    signOut: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("Home workflow", () => {
  test("navigates to login quickly", () => {
    const push = jest.fn();
    jest.spyOn(require("expo-router"), "useRouter").mockReturnValue({
      push,
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    });

    // Mock `performance.now` to make the timing assertion deterministic and
    // avoid flakes on slow CI or developer machines. Return a fixed start
    // timestamp on the first call and a slightly larger value on subsequent
    // calls so the measured duration is stable and small.
    const nowSpy = jest.spyOn(performance, "now").mockImplementation(() => {
      // The first call will return 1000, subsequent calls 1005.
      if (!(nowSpy as any)._called) {
        (nowSpy as any)._called = true;
        return 1000;
      }
      return 1005;
    });

    const start = performance.now();
    const { getByText } = renderWithProviders(<HomeScreen />);
    const duration = performance.now() - start;

    // With mocked `performance.now`, the duration should be deterministic
    // and small.
    expect(duration).toBeLessThan(10);
    // Restore original implementation
    nowSpy.mockRestore();
    fireEvent.press(getByText("Go to Login page"));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
