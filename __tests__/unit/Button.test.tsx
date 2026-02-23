import {
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { fireEvent } from "@testing-library/react-native";
import React from "react";

import { renderWithProviders } from "../test-utils/render";
import { Button } from "../../src/components/ui/Button";

describe("Button", () => {
  test("renders title and handles press", () => {
    const onPress = jest.fn();
    const { getByText } = renderWithProviders(
      <Button
        title="Tap me"
        onPress={onPress}
      />,
    );

    fireEvent.press(getByText("Tap me"));
    expect(onPress).toHaveBeenCalled();
  });

  test("accepts functional style prop", () => {
    const styleFn = jest.fn<StyleProp<ViewStyle>, [PressableStateCallbackType]>(
      ({ pressed }) => ({
        padding: pressed ? 24 : 20,
      }),
    );

    renderWithProviders(
      <Button
        title="Styled"
        style={styleFn}
      />,
    );

    expect(styleFn).toHaveBeenCalled();
  });
});
