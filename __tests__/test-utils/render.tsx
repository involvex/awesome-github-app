import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "../../src/contexts/ThemeContext";
import { render, waitFor } from "@testing-library/react-native";
import type { ReactElement } from "react";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createQueryClient() } = {},
) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{ui}</ThemeProvider>
    </QueryClientProvider>,
  );
}

export async function renderHookAndWait<T>(
  hook: () => T,
  client = createQueryClient(),
): Promise<T> {
  let result: T | undefined;

  const Test = () => {
    result = hook();
    return null;
  };

  render(
    <QueryClientProvider client={client}>
      <Test />
    </QueryClientProvider>,
  );

  await waitFor(() => {
    if (result && typeof result === "object" && "isSuccess" in result) {
      const state = result as Record<string, unknown>;
      if (state.isSuccess === true || state.isError === true) {
        return true;
      }
    }
    return false;
  });

  return result!;
}
