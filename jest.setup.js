require("@testing-library/jest-native/extend-expect");
const mockAsyncStorage = require("@react-native-async-storage/async-storage/jest/async-storage-mock");

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { oauth: {} }, owner: "owner", slug: "slug" },
  },
  ExecutionEnvironment: { StoreClient: "store" },
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
  openBrowserAsync: jest.fn(),
  dismissBrowser: jest.fn(),
}));

jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "https://example.com"),
  parse: jest.fn(() => ({})),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "https://example.com/callback"),
  useAuthRequest: jest.fn(() => [
    { codeVerifier: "verifier" },
    null,
    jest.fn(),
  ]),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-router", () => {
  const React = require("react");
  const Stack = ({ children }) => <>{children}</>;
  Stack.Screen = ({ children }) => <>{children}</>;
  const Tabs = ({ children }) => <>{children}</>;
  Tabs.Screen = ({ children }) => <>{children}</>;
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    }),
    useLocalSearchParams: jest.fn(() => ({})),
    useNavigation: () => ({ setOptions: jest.fn() }),
    Stack,
    Tabs,
    Slot: ({ children }) => <>{children}</>,
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
    },
    Link: ({ children }) => <>{children}</>,
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

const { notifyManager } = require("@tanstack/query-core");
notifyManager.setBatchNotifyFunction(fn => fn());

if (typeof window === "undefined") {
  global.window = global;
}

if (!window.addEventListener) {
  window.addEventListener = jest.fn();
  window.removeEventListener = jest.fn();
  window.dispatchEvent = jest.fn();
}

if (!global.navigator) {
  global.navigator = { onLine: true };
}

global.__DEV__ = true;

const originalError = console.error;
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation((...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("not wrapped in act(")
    ) {
      return;
    }
    originalError(...args);
  });
});

afterAll(() => {
  console.error.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
});
