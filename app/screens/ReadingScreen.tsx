import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radius, spacing, typography } from "@/constants/design";
import { getTimezoneLabel } from "@/constants/timezones";
import { getHostingerDeviceData } from "@/services/api";
import { extractSetupInfo } from "@/services/extracter";
import { Feather } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

type DliReading = {
  value: number;
  time?: string;
  date?: string;
};

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

export default function ReadingScreen({ navigation }: any) {
  const route = useRoute();
  const deviceData = (route.params as ReadingRouteParams | undefined)
    ?.deviceData;

  const [readings, setReadings] = useState<DliReading[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [status, setStatus] = useState<DeviceStatus>("idle");
  const [wifiStatus, setWifiStatus] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

      if (Array.isArray(data?.dli_history) && data.dli_history.length > 0) {
        setReadings(data.dli_history);
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
        setReadings([]);
      } else {
        setReadings([]);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const formatValue = (val: number): string => {
    if (val === 0) return "0";
    if (val < 0.01) return val.toFixed(5).replace(/\.?0+$/, "");
    return val.toString();
  };

  const getValueColor = (val: number): string => {
    if (val === 0) return colors.textMuted;
    if (val >= 20) return colors.secondary;
    if (val >= 5) return colors.accent;
    return colors.warning;
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
              <Text style={styles.deviceLabel}>MAC</Text>
              <Text style={styles.deviceValue}>{deviceInfo.mac}</Text>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>SSID</Text>
              <Text style={styles.deviceValue}>{deviceInfo.ssid}</Text>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>TZ</Text>
              <Text style={styles.deviceValue}>
                {getTimezoneLabel(deviceInfo.timezone)}
              </Text>
            </View>

            <View style={styles.buttonRow}>
              {deviceInfo.jsonPath && (
                <AppButton
                  title="View JSON"
                  icon="file-text"
                  onPress={() => {
                    navigation.navigate("LiveReadings", { deviceData });
                  }}
                  style={styles.compactButton}
                />
              )}
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
                  style={styles.compactButton}
                />
              )}
            </View>
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

        <FlatList
          data={readings}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.secondary}
              colors={[colors.secondary]}
            />
          }
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            readings.length > 0 ? (
              <Text style={styles.listHeader}>{readings.length} readings</Text>
            ) : null
          }
          ListEmptyComponent={
            status !== "connected_wifi" ? (
              <View style={styles.emptyBox}>
                <Feather name="bar-chart-2" size={28} color={colors.textMuted} />
                <Text style={styles.emptyText}>No readings yet.</Text>
                <Text style={styles.emptySubText}>
                  Data will appear once the device syncs.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <AppCard style={styles.card}>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>#{index + 1}</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.valueRow}>
                  <Text
                    style={[
                      styles.valueNumber,
                      { color: getValueColor(item.value) },
                    ]}
                  >
                    {formatValue(item.value)}
                  </Text>
                  <Text style={styles.valueUnit}>mol/m2/d</Text>
                </View>

                {(item.time || item.date) && (
                  <View style={styles.metaRow}>
                    {item.time && (
                      <View style={styles.metaChip}>
                        <Text style={styles.metaLabel}>TIME</Text>
                        <Text style={styles.metaValue}>{item.time}</Text>
                      </View>
                    )}
                    {item.date && (
                      <View style={styles.metaChip}>
                        <Text style={styles.metaLabel}>DATE</Text>
                        <Text style={styles.metaValue}>{item.date}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </AppCard>
          )}
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
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  compactButton: {
    flex: 1,
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
  listHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 40,
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.secondary,
  },
  cardBody: {
    flex: 1,
    gap: spacing.sm,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  valueNumber: {
    fontSize: 28,
    fontWeight: "800",
  },
  valueUnit: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metaChip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginTop: 1,
  },
  emptyBox: {
    marginTop: 80,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textInverse,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
});
