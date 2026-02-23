// import React from "react";

import { renderWithProviders } from "../test-utils/render";
import { Input } from "../../src/components/ui/Input";

describe("Input", () => {
  test("renders label and placeholder", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <Input
        label="Username"
        placeholder="octocat"
      />,
    );

    getByText("Username");
    getByPlaceholderText("octocat");
  });

  test("renders error message", () => {
    const { getByText } = renderWithProviders(
      <Input
        label="Email"
        error="Required"
      />,
    );

    getByText("Required");
  });
});
