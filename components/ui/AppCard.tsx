import { colors, radius, shadows, spacing } from "@/constants/design";
import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type AppCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  tone?: "light" | "dark";
}>;

export function AppCard({ children, style, tone = "light" }: AppCardProps) {
  return (
    <View style={[styles.card, tone === "dark" && styles.darkCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.xxl,
    ...shadows.card,
  },
  darkCard: {
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
});
