import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor, act } from "@testing-library/react-native";
import { ThemeProvider } from "../../src/contexts/ThemeContext";
import type { ReactElement } from "react";
import React from "react";

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
      <ThemeProvider>
        <Test />
      </ThemeProvider>
    </QueryClientProvider>,
  );

  // Give React Query time to register and start the query
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });

  // Wait for the hook result to reflect the query state
  await waitFor(
    () => {
      if (result && typeof result === "object" && "isSuccess" in result) {
        const state = result as Record<string, unknown>;
        if (state.isSuccess === true || state.isError === true) {
          return true;
        }
      }
      return false;
    },
    { timeout: 5000 },
  );

  return result!;
}

export function renderHookForMutation<T>(
  hook: () => T,
  client = createQueryClient(),
): { result: { current: T } } {
  let result: T | undefined;

  const Test = () => {
    result = hook();
    return null;
  };

  renderWithProviders(<Test />, { queryClient: client });

  // For mutations, we don't need to wait for queries, just return the hook result
  // The mutation will be tested by calling mutateAsync on the returned result
  return { result: { current: result! } };
}
