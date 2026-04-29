import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, spacing, typography } from "@/constants/design";
import { StyleSheet, Text, View } from "react-native";

export default function HistoryScreen() {
  return (
    <ScreenBackground>
      <View style={styles.container}>
        <AppCard>
          <ScreenHeader eyebrow="READING HISTORY" title="History" icon="clock" />
          <View style={styles.divider} />
          <Text style={styles.subtitle}>History view is not implemented yet.</Text>
        </AppCard>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.screen,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
  },
  subtitle: {
    ...typography.subtitle,
    color: colors.textMuted,
    textAlign: "center",
  },
});
