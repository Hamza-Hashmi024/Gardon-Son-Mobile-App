export const colors = {
  primary: "#0B1F3A",
  secondary: "#00C9A7",
  accent: "#3B82F6",
  warning: "#F59E0B",
  background: "#0B1F3A",
  surface: "#F0F4FA",
  surfaceMuted: "#E2EAF4",
  surfaceDark: "#112240",
  border: "#D5DDE8",
  borderDark: "#1E3A5F",
  text: "#0B1F3A",
  textInverse: "#FFFFFF",
  textMuted: "#5A7290",
  placeholder: "#8A9BB0",
  successSurface: "#0F2D1A",
  input: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 24,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 24,
};

export const typography = {
  eyebrow: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: "800" as const,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1,
  },
  button: {
    fontSize: 15,
    fontWeight: "800" as const,
  },
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
