import { colors, radius, spacing, typography } from "@/constants/design";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

type AppInputProps = TextInputProps & {
  label: string;
  compact?: boolean;
};

export function AppInput({ label, compact, style, ...props }: AppInputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, compact && styles.compactInput, style]}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.input,
    fontWeight: "500",
  },
  compactInput: {
    width: 120,
  },
});
