import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#A8B3BD",
    textMuted: "#6F7C87",
    buttonText: "#FFFFFF",
    buttonTextDark: "#05120C",
    tabIconDefault: "#6F7C87",
    tabIconSelected: "#3CFFB0",
    link: "#2F8CFF",
    backgroundRoot: "#02070b",
    backgroundDefault: "#0B1218",
    backgroundSecondary: "#111A22",
    backgroundTertiary: "#1C2A35",
    primary: "#3CFFB0",
    primarySoft: "#2EDC9C",
    secondary: "#2F8CFF",
    secondaryMuted: "#1E5FAF",
    success: "#41F5A3",
    warning: "#F6C343",
    warningAmber: "#E9B949",
    warningMuted: "#D8B55A",
    error: "#FF4D4D",
    errorDark: "#8B1E1E",
    border: "#1C2A35",
    disabled: "#2A333B",
    disabledText: "#6F7C87",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A8B3BD",
    textMuted: "#6F7C87",
    buttonText: "#FFFFFF",
    buttonTextDark: "#05120C",
    tabIconDefault: "#6F7C87",
    tabIconSelected: "#3CFFB0",
    link: "#2F8CFF",
    backgroundRoot: "#02070b",
    backgroundDefault: "#0B1218",
    backgroundSecondary: "#111A22",
    backgroundTertiary: "#1C2A35",
    primary: "#3CFFB0",
    primarySoft: "#2EDC9C",
    secondary: "#2F8CFF",
    secondaryMuted: "#1E5FAF",
    success: "#41F5A3",
    warning: "#F6C343",
    warningAmber: "#E9B949",
    warningMuted: "#D8B55A",
    error: "#FF4D4D",
    errorDark: "#8B1E1E",
    border: "#1C2A35",
    disabled: "#2A333B",
    disabledText: "#6F7C87",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 56,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  timer: {
    fontSize: 48,
    fontWeight: "700" as const,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  bodyLarge: {
    fontSize: 24,
    fontWeight: "500" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  glowGreen: {
    shadowColor: "#3CFFB0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  glowRed: {
    shadowColor: "#FF4D4D",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  glowBlue: {
    shadowColor: "#2F8CFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
};
