import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { Button } from "../../src/components/ui/Button";

describe("Button", () => {
  test("renders title and handles press", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button
        title="Tap me"
        onPress={onPress}
      />,
    );

    fireEvent.press(getByText("Tap me"));
    expect(onPress).toHaveBeenCalled();
  });

  test("accepts functional style prop", () => {
    const styleFn = jest.fn(() => ({
      padding: 20,
    }));

    render(
      <Button
        title="Styled"
        style={styleFn}
      />,
    );

    expect(styleFn).toHaveBeenCalled();
  });
});
