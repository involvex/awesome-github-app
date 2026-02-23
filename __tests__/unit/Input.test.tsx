import { render } from "@testing-library/react-native";
import React from "react";

import { Input } from "../../src/components/ui/Input";

describe("Input", () => {
  test("renders label and placeholder", () => {
    const { getByText, getByPlaceholderText } = render(
      <Input
        label="Username"
        placeholder="octocat"
      />,
    );

    getByText("Username");
    getByPlaceholderText("octocat");
  });

  test("renders error message", () => {
    const { getByText } = render(
      <Input
        label="Email"
        error="Required"
      />,
    );

    getByText("Required");
  });
});
