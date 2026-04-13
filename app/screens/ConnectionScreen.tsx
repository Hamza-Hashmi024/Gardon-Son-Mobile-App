import { useCallback, useEffect, useState } from "react";
import { AppState, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Linking from "expo-linking";

import { checkDeviceConnection } from "@/app/services/api";

export default function ConnectionScreen({ navigation }: any) {
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const verifyConnection = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage("");

    const isConnected = await checkDeviceConnection();

    if (isConnected) {
      navigation.replace("Setup");
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

      await Linking.openSettings();
    } catch (error) {
      console.error("❌ openWifiSettings error:", error);
      setErrorMessage(
        "Unable to open Wi-Fi settings automatically. Please open your phone settings and connect to the Garden Sun Wi-Fi.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.accentTopRight} />
      <View style={styles.accentBottomLeft} />

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>⌁</Text>
          </View>
          <View>
            <Text style={styles.eyebrow}>DEVICE CONNECTION</Text>
            <Text style={styles.title}>Connect to Garden Sun</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.message}>
          {isChecking
            ? "Checking connection with your Garden Sun device..."
            : errorMessage}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={openWifiSettings}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Open Wi-Fi Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={verifyConnection}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>
            {isChecking ? "Checking..." : "Retry Connection"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          After connecting to the Garden Sun Wi-Fi, come back to the app and it
          will continue automatically.
        </Text>
      </View>
    </View>
  );
}

const NAVY = "#0B1F3A";
const TEAL = "#00C9A7";
const CARD_BG = "#F0F4FA";
const BORDER = "#D5DDE8";
const LABEL_COLOR = "#5A7290";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    justifyContent: "center",
    padding: 24,
  },
  accentTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: TEAL,
    opacity: 0.12,
  },
  accentBottomLeft: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#3B82F6",
    opacity: 0.1,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
    color: TEAL,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: TEAL,
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 22,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: NAVY,
    marginBottom: 20,
  },
  button: {
    backgroundColor: NAVY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: TEAL,
    marginBottom: 12,
  },
  buttonText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  footerNote: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: LABEL_COLOR,
  },
});
