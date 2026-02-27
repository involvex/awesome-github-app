import { Markdown } from "../../src/components/ui/Markdown";
import { renderWithProviders } from "../test-utils/render";
import { screen } from "@testing-library/react-native";
import React from "react";

describe("Markdown Component", () => {
  it("renders text correctly", () => {
    renderWithProviders(<Markdown>Hello World</Markdown>);
    expect(screen.getByText("Hello World")).toBeTruthy();
  });

  it("renders headings correctly", () => {
    renderWithProviders(
      <Markdown>{`# Heading One

## Heading Two`}</Markdown>,
    );
    expect(screen.getByText("Heading One")).toBeTruthy();
    expect(screen.getByText("Heading Two")).toBeTruthy();
  });

  it("renders images without crashing", () => {
    const markdown = "![Alt text](https://example.com/image.png)";
    renderWithProviders(<Markdown>{markdown}</Markdown>);
    // We can't easily check for the image presence in unit tests with jest-expo
    // without complex mocks, but we can verify it doesn't crash during render.
    // This also implicitly tests the React 19 key spread fix in our image rule.
  });
});
