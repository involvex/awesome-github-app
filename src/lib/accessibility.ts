import {
  AccessibilityRole,
  Platform,
  AccessibilityActionInfo,
  AccessibilityState,
  findNodeHandle,
  NativeModules,
} from "react-native";
import type React from "react";

/**
 * Accessibility Utilities
 *
 * Helper functions for improving accessibility in React Native apps.
 * These utilities provide consistent accessibility support across components.
 */

const { UIManager } = NativeModules;

type NativeAccessibilityManager = {
  announceForAccessibility?: (message: string) => void;
  isScreenReaderEnabled?: boolean;
  isTouchExplorationEnabled?: boolean;
};

const getAccessibilityManager = (): NativeAccessibilityManager | undefined => {
  return (
    NativeModules as { AccessibilityManager?: NativeAccessibilityManager }
  ).AccessibilityManager;
};

/**
 * Announce a message for screen readers
 *
 * This function is primarily used on iOS with VoiceOver. On Android,
 * announcements are handled differently via AccessibilityEvent.
 *
 * @param message - The message to announce
 * @example
 * ```tsx
 * announceForAccessibility("Download complete");
 * ```
 */
export function announceForAccessibility(message: string): void {
  if (Platform.OS === "ios") {
    // iOS: Use UIAccessibilityPostNotification
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager && accessibilityManager.announceForAccessibility) {
      accessibilityManager.announceForAccessibility(message);
    }
  } else if (Platform.OS === "android") {
    // Android: Use AccessibilityEvent
    // Note: This requires additional setup on Android
    console.warn(
      "Accessibility announcements on Android require additional setup. Consider using a Toast or Snackbar instead.",
    );
  }
}

/**
 * Set accessibility focus to a component
 *
 * Use this to move screen reader focus to a specific element.
 * Useful for moving focus after an action completes.
 *
 * @param ref - The React ref of the component to focus
 * @example
 * ```tsx
 * const buttonRef = useRef<View>(null);
 *
 * const handleSuccess = () => {
 *   // Do work...
 *   setAccessibilityFocus(successMessageRef);
 * };
 *
 * <View ref={successMessageRef} accessible accessibilityLabel="Success">
 *   Your changes were saved
 * </View>
 * ```
 */
export function setAccessibilityFocus(
  ref: React.RefObject<Parameters<typeof findNodeHandle>[0]>,
): void {
  if (!ref.current) return;

  const tag = findNodeHandle(ref.current);
  if (tag && UIManager && UIManager.sendAccessibilityEvent) {
    UIManager.sendAccessibilityEvent(
      tag,
      UIManager.AccessibilityEventTypes.typeViewFocused,
    );
  }
}

/**
 * Get accessibility role from a component type
 *
 * Maps common component patterns to proper accessibility roles.
 *
 * @param role - The role string or undefined
 * @returns The proper AccessibilityRole
 * @example
 * ```tsx
 * const buttonRole = getAccessibilityRole("button"); // "button"
 * const linkRole = getAccessibilityRole("link"); // "link"
 * ```
 */
export function getAccessibilityRole(role?: string): AccessibilityRole {
  const validRoles: AccessibilityRole[] = [
    "none",
    "button",
    "link",
    "search",
    "image",
    "keyboardkey",
    "text",
    "adjustable",
    "imagebutton",
    "header",
    "summary",
    "alert",
    "checkbox",
    "combobox",
    "menu",
    "menuitem",
    "progressbar",
    "radio",
    "radiogroup",
    "scrollbar",
    "spinbutton",
    "switch",
    "tab",
    "tablist",
    "timer",
    "toolbar",
    "list",
  ];

  if (!role) return "none";

  const normalized = role.toLowerCase();
  if (validRoles.includes(normalized as AccessibilityRole)) {
    return normalized as AccessibilityRole;
  }

  // Fallback mappings for common patterns
  if (normalized === "btn" || normalized === "button") return "button";
  if (normalized === "anchor" || normalized === "href") return "link";
  if (normalized === "heading") return "header";
  if (normalized === "checkbox") return "checkbox";

  return "none";
}

/**
 * Create accessibility props for an interactive element
 *
 * Generates a consistent set of accessibility props for buttons,
 * links, and other interactive elements.
 *
 * @param options - Accessibility options
 * @returns Accessibility props object
 * @example
 * ```tsx
 * <Pressable {...makeAccessibilityProps({
 *   label: "Delete item",
 *   hint: "Will permanently delete this item",
 *   role: "button",
 *   disabled: false,
 * })}>
 *   <Text>Delete</Text>
 * </Pressable>
 * ```
 */
export interface AccessibilityPropsOptions {
  label?: string;
  hint?: string;
  role?: AccessibilityRole;
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | "mixed";
  expanded?: boolean;
}

export function makeAccessibilityProps(
  options: AccessibilityPropsOptions = {},
) {
  const { label, hint, role, disabled, selected, checked, expanded } = options;

  const props: {
    accessible: true;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
  } = {
    accessible: true,
  };

  if (label) {
    props.accessibilityLabel = label;
  }

  if (hint) {
    props.accessibilityHint = hint;
  }

  if (role) {
    props.accessibilityRole = role;
  }

  const state: AccessibilityState = {};
  if (disabled !== undefined) {
    state.disabled = disabled;
  }
  if (selected !== undefined) {
    state.selected = selected;
  }
  if (checked !== undefined) {
    state.checked = checked;
  }
  if (expanded !== undefined) {
    state.expanded = expanded;
  }

  if (Object.keys(state).length > 0) {
    props.accessibilityState = state;
  }

  return props;
}

/**
 * Check if screen reader is enabled
 *
 * Returns true if a screen reader (VoiceOver on iOS, TalkBack on Android) is active.
 * Useful for conditional UI behavior.
 *
 * @returns Promise resolving to boolean
 * @example
 * ```tsx
 * const isScreenReaderEnabled = await isScreenReaderActive();
 * if (isScreenReaderEnabled) {
 *   // Provide extra context for screen reader users
 * }
 * ```
 */
export async function isScreenReaderActive(): Promise<boolean> {
  if (Platform.OS === "ios") {
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager && accessibilityManager.isScreenReaderEnabled) {
      return accessibilityManager.isScreenReaderEnabled;
    }
  } else if (Platform.OS === "android") {
    const accessibilityManager = getAccessibilityManager();
    if (
      accessibilityManager &&
      accessibilityManager.isTouchExplorationEnabled
    ) {
      return accessibilityManager.isTouchExplorationEnabled;
    }
  }
  return false;
}

/**
 * Accessibility action names
 *
 * Predefined accessibility actions for interactive elements.
 */
export const AccessibilityActions = {
  activate: "activate",
  longPress: "longpress",
  increment: "increment",
  decrement: "decrement",
  focus: "focus",
  blur: "blur",
} as const;

/**
 * Helper to create an accessibility action info object
 *
 * @param actionName - The action name to create
 * @returns AccessibilityActionInfo object
 * @example
 * ```tsx
 * const incrementAction = createAccessibilityAction("increment");
 *
 * <View
 *   accessibilityActions={[incrementAction]}
 *   onAccessibilityAction={(event) => {
 *     switch (event.nativeEvent.actionName) {
 *       case "increment":
 *         setValue(prev => prev + 1);
 *         break;
 *     }
 *   }}
 * />
 * ```
 */
export function createAccessibilityAction(
  actionName: string,
): AccessibilityActionInfo {
  return {
    name: actionName,
    label: actionName,
  };
}
