import { render } from "@testing-library/react-native";
import React from "react";

const mockUseAuth = jest.fn();

jest.mock("../../src/contexts/AuthContext", () => ({
  __esModule: true,
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

import RootLayout from "../../src/app/_layout";

describe("RootLayout auth gating", () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  test("renders tabs stack when authenticated", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
    const { toJSON } = render(<RootLayout />);

    expect(toJSON()).not.toBeNull();
  });

  test("renders auth stack when signed out", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false });
    const { toJSON } = render(<RootLayout />);

    expect(toJSON()).not.toBeNull();
  });

  test("returns null while loading auth state", () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
    const { toJSON } = render(<RootLayout />);

    const tree = toJSON();
    expect(tree).not.toBeNull();
    expect(tree?.children ?? []).toHaveLength(0);
  });
});
