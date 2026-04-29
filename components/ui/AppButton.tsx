import { colors, radius, spacing, typography } from "@/constants/design";
import { Feather } from "@expo/vector-icons";
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type FeatherIconName = keyof typeof Feather.glyphMap;

type AppButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: FeatherIconName;
  variant?: "primary" | "secondary" | "accent";
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  disabled = false,
  icon,
  variant = "primary",
  style,
}: AppButtonProps) {
  const isSecondary = variant === "secondary";
  const isAccent = variant === "accent";
  const foregroundColor = isSecondary
    ? colors.primary
    : isAccent
      ? colors.textInverse
      : colors.secondary;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary && styles.secondaryButton,
        isAccent && styles.accentButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
    >
      {icon && (
        <Feather
          name={icon}
          size={17}
          color={foregroundColor}
        />
      )}
      <Text
        style={[
          styles.text,
          isSecondary && styles.secondaryText,
          isAccent && styles.accentText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  accentButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  secondaryButton: {
    backgroundColor: colors.input,
    borderColor: colors.border,
  },
  disabledButton: {
    opacity: 0.65,
  },
  text: {
    ...typography.button,
    color: colors.secondary,
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: "700",
  },
  accentText: {
    color: colors.textInverse,
  },
});
