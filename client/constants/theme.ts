import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A0AEC0",
    tabIconSelected: "#FF6B5A",
    link: "#4ECDC4",
    backgroundRoot: "#1A2332",
    backgroundDefault: "#2D3748",
    backgroundSecondary: "#3D4A5C",
    backgroundTertiary: "#4A5568",
    primary: "#FF6B5A",
    secondary: "#4ECDC4",
    success: "#48BB78",
    warning: "#F6AD55",
    error: "#FC8181",
    border: "#4A5568",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    buttonText: "#FFFFFF",
    tabIconDefault: "#A0AEC0",
    tabIconSelected: "#FF6B5A",
    link: "#4ECDC4",
    backgroundRoot: "#1A2332",
    backgroundDefault: "#2D3748",
    backgroundSecondary: "#3D4A5C",
    backgroundTertiary: "#4A5568",
    primary: "#FF6B5A",
    secondary: "#4ECDC4",
    success: "#48BB78",
    warning: "#F6AD55",
    error: "#FC8181",
    border: "#4A5568",
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
};
