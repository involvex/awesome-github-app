import { fireEvent } from "@testing-library/react-native";

import { renderWithProviders } from "../test-utils/render";
import HomeScreen from "../../src/app/index";

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

    expect(duration).toBeLessThan(250);
    fireEvent.press(getByText("Go to Login page"));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
