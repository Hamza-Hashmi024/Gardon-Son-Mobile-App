import { colors, radius, spacing, typography } from "@/constants/design";
import { Feather } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type FeatherIconName = keyof typeof Feather.glyphMap;

type ScreenHeaderProps = {
  eyebrow: string;
  title: string;
  icon: FeatherIconName;
  inverted?: boolean;
  trailing?: ReactNode;
};

export function ScreenHeader({
  eyebrow,
  title,
  icon,
  inverted = false,
  trailing,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={[styles.iconBox, !inverted && styles.lightIconBox]}>
        <Feather name={icon} size={22} color={colors.secondary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={[styles.title, !inverted && styles.lightTitle]}>
          {title}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1.5,
    borderColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  lightIconBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textWrap: {
    flex: 1,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.secondary,
    marginBottom: 2,
  },
  title: {
    ...typography.title,
    color: colors.textInverse,
  },
  lightTitle: {
    color: colors.text,
  },
});
