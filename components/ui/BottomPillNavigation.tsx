import { colors, radius, shadows, spacing } from "@/constants/design";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherIconName = keyof typeof Feather.glyphMap;

type BottomPillNavigationItem = {
  key: string;
  label: string;
  icon: FeatherIconName;
  active: boolean;
  onPress: () => void;
};

type BottomPillNavigationProps = {
  items: BottomPillNavigationItem[];
};

export function BottomPillNavigation({ items }: BottomPillNavigationProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          bottom: Math.max(insets.bottom, spacing.md),
        },
      ]}
    >
      <View style={styles.bar}>
        {items.map((item) => {
          const color = item.active ? colors.primary : colors.textMuted;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.item, item.active && styles.activeItem]}
              onPress={item.onPress}
              activeOpacity={0.85}
            >
              <Feather name={item.icon} size={18} color={color} />
              <Text style={[styles.label, { color }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
  },
  bar: {
    minHeight: 68,
    borderRadius: radius.card,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card,
  },
  item: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  activeItem: {
    backgroundColor: colors.surfaceMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
  },
});
