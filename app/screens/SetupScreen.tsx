import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { TimezoneSelect } from "@/components/ui/TimezoneSelect";
import { colors, spacing, typography } from "@/constants/design";
import { getTimezoneLabel } from "@/constants/timezones";
import { sendDeviceConfig } from "@/services/api";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function SetupScreen({ navigation }: any) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await sendDeviceConfig(ssid, password, timezone);
      Alert.alert(
        "Device Setup",
        `Setup complete. SSID "${result.storedConfig.ssid}" and timezone "${getTimezoneLabel(result.storedConfig.timezone)}" are stored on the Garden Sun device.`,
      );
      navigation.replace("Dashboard", { deviceData: result.responseText });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to configure device.";

      Alert.alert("Setup Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <AppCard>
          <ScreenHeader
            eyebrow="CONFIGURATION"
            title="Device Setup"
            icon="settings"
          />

          <View style={styles.divider} />

          <AppInput
            label="NETWORK SSID"
            value={ssid}
            onChangeText={setSsid}
            placeholder="Enter WiFi SSID"
          />

          <AppInput
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter WiFi Password"
            secureTextEntry
          />

          <TimezoneSelect
            label="TIMEZONE"
            value={timezone}
            onChange={setTimezone}
          />

          <AppButton
            title={isSubmitting ? "Saving..." : "Save & Continue"}
            icon="arrow-right"
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.button}
          />

          <Text style={styles.footerNote}>
            Make sure your device is powered on and nearby.
          </Text>
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
    marginBottom: spacing.xxl,
  },
  button: {
    marginTop: spacing.sm,
  },
  footerNote: {
    marginTop: spacing.lg,
    textAlign: "center",
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
