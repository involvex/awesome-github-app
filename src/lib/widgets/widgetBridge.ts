import { NativeModules, Platform } from "react-native";

interface WidgetDataNativeModule {
  setWidgetData(
    prefsName: string,
    key: string,
    value: string,
  ): Promise<unknown>;
  setWidgetInt(prefsName: string, key: string, value: number): Promise<unknown>;
  requestWidgetUpdate(providerClassName: string): Promise<number>;
}

function getNativeModule(): WidgetDataNativeModule | null {
  if (Platform.OS !== "android") return null;
  const mod = (NativeModules as Record<string, unknown>).WidgetData;
  if (!mod || typeof mod !== "object") return null;
  const typed = mod as Partial<WidgetDataNativeModule>;
  if (
    typeof typed.setWidgetData !== "function" ||
    typeof typed.setWidgetInt !== "function" ||
    typeof typed.requestWidgetUpdate !== "function"
  ) {
    return null;
  }
  return typed as WidgetDataNativeModule;
}

/** True when the SharedPreferences widget bridge is available (Android release/dev-client). */
export function isWidgetBridgeAvailable(): boolean {
  return getNativeModule() !== null;
}

export async function writeWidgetString(
  prefsName: string,
  key: string,
  value: string,
): Promise<boolean> {
  const mod = getNativeModule();
  if (!mod) return false;
  try {
    await mod.setWidgetData(prefsName, key, value);
    return true;
  } catch {
    return false;
  }
}

export async function writeWidgetInt(
  prefsName: string,
  key: string,
  value: number,
): Promise<boolean> {
  const mod = getNativeModule();
  if (!mod) return false;
  try {
    await mod.setWidgetInt(prefsName, key, value);
    return true;
  } catch {
    return false;
  }
}

export async function requestWidgetUpdate(
  providerClassName: string,
): Promise<number> {
  const mod = getNativeModule();
  if (!mod) return 0;
  try {
    return await mod.requestWidgetUpdate(providerClassName);
  } catch {
    return 0;
  }
}
