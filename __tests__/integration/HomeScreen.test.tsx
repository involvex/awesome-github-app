import { renderWithProviders } from "../test-utils/render";
import { fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../src/app/index";
import { useRouter } from "expo-router";
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

describe("HomeScreen", () => {
  test("renders hero content and navigates to login", () => {
    const push = jest.fn();
    jest.spyOn(require("expo-router"), "useRouter").mockReturnValue({
      push,
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    });

    const { getByText } = renderWithProviders(<HomeScreen />);

    getByText("awesome-github-app");
    const button = getByText("Go to Login page");
    fireEvent.press(button);
    expect(push).toHaveBeenCalledWith("/login");
  });
});
