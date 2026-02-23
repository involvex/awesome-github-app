import { render } from "@testing-library/react-native";
import { describe, test } from "@jest/globals";

import HomeScreen from "../src/app/index";
import Button from "../src/app/index";

describe("<HomeScreen />", () => {
  (test("Text renders correctly on HomeScreen", () => {
    const { getByText } = render(<HomeScreen />);

    getByText("awesome-github-app");
  }),
    test("Button renders correctly on HomeScreen", () => {
      const { getByText } = render(<Button />);

      getByText("Go to Login page");
    }));
});
