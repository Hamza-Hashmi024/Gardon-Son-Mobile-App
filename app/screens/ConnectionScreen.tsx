import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, spacing, typography } from "@/constants/design";
import { checkDeviceConnection } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";

export default function ConnectionScreen({ navigation }: any) {
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const verifyConnection = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage("");

    const isConnected = await checkDeviceConnection();

    if (isConnected) {
      // If device was already configured, skip setup and go straight to readings
      const deviceJsonFile = await AsyncStorage.getItem("deviceJsonFile");
      if (deviceJsonFile) {
        const mac = deviceJsonFile.replace(/\.json$/i, "");
        navigation.replace("LiveReadings", { mac });
      } else {
        navigation.replace("Setup");
      }
      return;
    }

    setErrorMessage(
      "Your phone is not connected to the Garden Sun device. Open Wi-Fi settings and connect to the device network first.",
    );
    setIsChecking(false);
  }, [navigation]);

  useEffect(() => {
    verifyConnection();
  }, [verifyConnection]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        verifyConnection();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [verifyConnection]);

  const openWifiSettings = async () => {
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.WIFI_SETTINGS");
        return;
      }

      if (Platform.OS === "ios") {
        try {
          await Linking.openURL("App-Prefs:root=WIFI");
        } catch {
          await Linking.openSettings();
        }
        return;
      }

      await Linking.openSettings();
    } catch {
      setErrorMessage(
        "Unable to open Wi-Fi settings automatically. Please open Settings, go to Wi-Fi, and connect to the Garden Sun network.",
      );
    }
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <AppCard>
          <ScreenHeader
            eyebrow="DEVICE CONNECTION"
            title="Connect to Garden Sun"
            icon="wifi"
          />

          <View style={styles.divider} />

          <Text style={styles.message}>
            {isChecking
              ? "Checking connection with your Garden Sun device..."
              : errorMessage}
          </Text>

          <AppButton
            title="Open Wi-Fi Settings"
            icon="settings"
            onPress={openWifiSettings}
            style={styles.button}
          />

          <AppButton
            title={isChecking ? "Checking..." : "Retry Connection"}
            icon="refresh-cw"
            onPress={verifyConnection}
            variant="secondary"
          />

          <Text style={styles.footerNote}>
            After connecting to the Garden Sun Wi-Fi, come back to the app and it
            will continue automatically.
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
  message: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  footerNote: {
    marginTop: spacing.lg,
    textAlign: "center",
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
