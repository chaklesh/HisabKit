import { vi } from "vitest";

// Mock React Native
vi.mock("react-native", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    Platform: {
      ...actual.Platform,
      select: vi.fn((objs) => objs.ios || objs.default),
    },
    Alert: {
      alert: vi.fn(),
    },
  };
});

// Mock Lucide Icons (they often break in node environments)
vi.mock("lucide-react-native", () => {
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        return prop; // Just return the name of the icon as a string component
      },
    },
  );
});

// Mock Navigation
vi.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock react-native-paper
vi.mock("react-native-paper", () => ({
  Avatar: {
    Text: "Avatar.Text",
    Image: "Avatar.Image",
  },
  Divider: "Divider",
  Text: "Text",
  Portal: "Portal",
  Dialog: {
    Title: "Dialog.Title",
    Content: "Dialog.Content",
    Actions: "Dialog.Actions",
  },
  useTheme: () => ({
    colors: {
      primary: "#6366f1",
      outline: "#cbd5e1",
    },
  }),
}));

// Mock react-native-safe-area-context
vi.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock expo-linear-gradient
vi.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock reanimated
vi.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    default: {
      View,
    },
    useSharedValue: vi.fn(() => ({ value: 0 })),
    useAnimatedStyle: vi.fn(() => ({})),
    withTiming: vi.fn(),
    withSpring: vi.fn(),
    runOnJS: vi.fn((fn: () => void) => fn),
  };
});
