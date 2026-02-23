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

    const start = performance.now();
    const { getByText } = renderWithProviders(<HomeScreen />);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(750);
    fireEvent.press(getByText("Go to Login page"));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
