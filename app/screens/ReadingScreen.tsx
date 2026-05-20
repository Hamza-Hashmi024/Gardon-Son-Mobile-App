import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radius, spacing, typography } from "@/constants/design";
import { getHostingerDeviceData } from "@/services/api";
import { extractSetupInfo } from "@/services/extracter";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

type DeviceInfo = {
  mac: string | null;
  ssid: string | null;
  timezone: string | null;
  jsonPath: string | null;
  restartPath: string | null;
};

type ReadingRouteParams = {
  deviceData?: string;
};

type DeviceStatus = "idle" | "connected_wifi" | "has_data";

const hasValidDliReading = (readings: unknown): boolean =>
  Array.isArray(readings) &&
  readings.some(
    (reading) =>
      typeof reading?.value === "number" &&
      Number.isFinite(reading.value) &&
      typeof reading.date === "string" &&
      reading.date.trim().length > 0 &&
      typeof reading.time === "string" &&
      reading.time.trim().length > 0,
  );

export default function ReadingScreen({ navigation }: any) {
  const route = useRoute();
  const deviceData = (route.params as ReadingRouteParams | undefined)
    ?.deviceData;

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [status, setStatus] = useState<DeviceStatus>("idle");
  const [wifiStatus, setWifiStatus] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (deviceData) {
      const parsed = extractSetupInfo(deviceData);
      setDeviceInfo(parsed);
    }
  }, [deviceData]);

  const fetchData = async () => {
    if (!deviceInfo?.mac) return;

    try {
      const data = await getHostingerDeviceData(deviceInfo.mac);

      if (hasValidDliReading(data?.dli_history)) {
        setStatus("has_data");
        setWifiStatus(null);
        const now = new Date();
        setLastUpdated(
          now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      } else if (data?.wifi_status) {
        setWifiStatus(data.wifi_status);
        setStatus("connected_wifi");
      } else {
        setStatus("idle");
      }
    } catch {}
  };

  useEffect(() => {
    if (!deviceInfo?.mac) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [deviceInfo?.mac]);

  const handleReconfigure = async () => {
    await AsyncStorage.removeItem("deviceJsonFile");
    navigation.replace("Connection");
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="LIVE MONITORING"
          title="DLI Readings"
          icon="sun"
          inverted
          trailing={
            lastUpdated ? (
              <View style={styles.lastUpdatedBadge}>
                <Feather name="refresh-cw" size={12} color={colors.secondary} />
                <Text style={styles.lastUpdatedText}>{lastUpdated}</Text>
              </View>
            ) : null
          }
        />

        <View style={styles.divider} />

        {deviceInfo && (
          <AppCard tone="dark" style={styles.deviceBox}>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>SSID</Text>
              <Text style={styles.deviceValue}>{deviceInfo.ssid}</Text>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>TZ</Text>
              <Text style={styles.deviceValue}>{deviceInfo.timezone}</Text>
            </View>

            {deviceInfo.restartPath && (
              <AppButton
                title="Restart"
                icon="power"
                variant="accent"
                onPress={async () => {
                  try {
                    const restartUrl = `http://192.168.4.1${deviceInfo.restartPath}`;
                    await fetch(restartUrl, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                      body: "restart=true",
                    });
                  } catch {
                  } finally {
                    navigation.replace("PostRestart", { deviceData });
                  }
                }}
                style={styles.restartButton}
              />
            )}
          </AppCard>
        )}

        {status === "connected_wifi" && (
          <View style={styles.wifiCard}>
            <Feather name="check-circle" size={18} color={colors.secondary} />
            <View style={styles.wifiCopy}>
              <Text style={styles.wifiTitle}>Device Connected</Text>
              {wifiStatus && <Text style={styles.wifiSub}>{wifiStatus}</Text>}
              <Text style={styles.wifiSub}>
                Waiting for first DLI reading...
              </Text>
            </View>
          </View>
        )}

        <AppButton
          title="Configure Device"
          icon="settings"
          variant="secondary"
          onPress={handleReconfigure}
          style={styles.configureButton}
        />

      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderDark,
    marginBottom: spacing.lg,
  },
  lastUpdatedBadge: {
    marginLeft: "auto",
    backgroundColor: colors.surfaceDark,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
  },
  deviceBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deviceLabel: {
    ...typography.label,
    color: colors.secondary,
    width: 38,
  },
  deviceValue: {
    fontSize: 12,
    color: colors.textInverse,
    flex: 1,
  },
  restartButton: {
    marginTop: spacing.md,
    minHeight: 44,
  },
  wifiCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.successSurface,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  wifiCopy: {
    flex: 1,
  },
  wifiTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textInverse,
    marginBottom: 2,
  },
  wifiSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  configureButton: {
    marginTop: spacing.md,
  },
});
