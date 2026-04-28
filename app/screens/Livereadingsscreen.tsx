import { getHostingerDeviceData } from "@/services/api";
import { extractSetupInfo } from "@/services/extracter";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

type LiveReadingsRouteParams = {
  deviceData?: string;
};

type DeviceStatus = "idle" | "connected_wifi" | "has_data";

export default function LiveReadingsScreen({ navigation }: any) {
  const route = useRoute();
  const deviceData = (route.params as LiveReadingsRouteParams | undefined)
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
    if (val < 0.01) return val.toFixed(5);
    if (val < 1) return val.toFixed(3);
    return val.toString();
  };

  const getValueColor = (val: number): string => {
    if (val === 0) return LABEL_COLOR;
    if (val >= 20) return "#00C9A7";
    if (val >= 5) return "#3B82F6";
    return "#F59E0B";
  };

  const handleRestart = async () => {
    if (!deviceInfo?.restartPath) return;

    try {
      const restartUrl = `http://192.168.4.1${deviceInfo.restartPath}`;
      await fetch(restartUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "restart=true",
      });
      // Navigate to PostRestart which handles the waiting + reconnect
      navigation.replace("PostRestart", { deviceData });
    } catch (err) {
      // Still navigate — device may have restarted before response
      navigation.replace("PostRestart", { deviceData });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.accentTopRight} />
      <View style={styles.accentBottomLeft} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>☀</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>LIVE MONITORING</Text>
          <Text style={styles.title}>DLI Readings</Text>
        </View>
        {lastUpdated && (
          <View style={styles.lastUpdatedBadge}>
            <Text style={styles.lastUpdatedText}>↻ {lastUpdated}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Device Info Bar */}
      {deviceInfo && (
        <View style={styles.deviceBar}>
          <View style={styles.devicePills}>
            {deviceInfo.mac && (
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>MAC</Text>
                <Text style={styles.pillValue} numberOfLines={1}>
                  {deviceInfo.mac}
                </Text>
              </View>
            )}
            {deviceInfo.ssid && (
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>SSID</Text>
                <Text style={styles.pillValue} numberOfLines={1}>
                  {deviceInfo.ssid}
                </Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {deviceInfo.jsonPath && (
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() => {
                  const url = `http://192.168.4.1${deviceInfo.jsonPath}`;
                  import("react-native").then(({ Linking }) =>
                    Linking.openURL(url),
                  );
                }}
              >
                <Text style={styles.actionBtnText}>{ }View JSON</Text>
              </TouchableOpacity>
            )}

            {deviceInfo.restartPath && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnRestart]}
                activeOpacity={0.8}
                onPress={handleRestart}
              >
                <Text style={[styles.actionBtnText, styles.actionBtnRestartText]}>
                  ⟳ Restart Device
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* WiFi Connected — waiting for data */}
      {status === "connected_wifi" && (
        <View style={styles.wifiCard}>
          <Text style={styles.wifiDot}>●</Text>
          <View>
            <Text style={styles.wifiTitle}>Device Connected</Text>
            {wifiStatus && (
              <Text style={styles.wifiSub}>{wifiStatus}</Text>
            )}
            <Text style={styles.wifiSub}>Waiting for first DLI reading…</Text>
          </View>
        </View>
      )}

      {/* DLI List */}
      <FlatList
        data={readings}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={TEAL}
            colors={[TEAL]}
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
              <Text style={styles.emptyIcon}>📡</Text>
              <Text style={styles.emptyText}>No readings yet.</Text>
              <Text style={styles.emptySubText}>
                Data will appear once the device syncs.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
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
                <Text style={styles.valueUnit}>mol/m²/d</Text>
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
          </View>
        )}
      />
    </View>
  );
}

const NAVY = "#0B1F3A";
const TEAL = "#00C9A7";
const CARD_BG = "#F0F4FA";
const LABEL_COLOR = "#5A7290";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    paddingTop: 56,
    paddingHorizontal: 20,
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#112240",
    borderWidth: 1.5,
    borderColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: TEAL },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: TEAL,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  lastUpdatedBadge: {
    backgroundColor: "#112240",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: TEAL,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: TEAL,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#1E3A5F",
    marginBottom: 14,
  },

  // Device bar
  deviceBar: {
    backgroundColor: "#112240",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 10,
  },
  devicePills: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    backgroundColor: "#0B1F3A",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    flexShrink: 1,
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: TEAL,
    letterSpacing: 1,
  },
  pillValue: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
    flexShrink: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    backgroundColor: TEAL,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  actionBtnText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "800",
  },
  actionBtnRestart: {
    backgroundColor: "#2196F3",
  },
  actionBtnRestartText: {
    color: "#FFFFFF",
  },

  // WiFi status card
  wifiCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#0F2D1A",
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  wifiDot: { fontSize: 14, color: TEAL, marginTop: 1 },
  wifiTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  wifiSub: { fontSize: 12, color: LABEL_COLOR },

  // List
  listHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: LABEL_COLOR,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 40,
    gap: 10,
  },

  // Card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    gap: 14,
    elevation: 3,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: { fontSize: 11, fontWeight: "700", color: TEAL },
  cardBody: { flex: 1, gap: 8 },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  valueNumber: { fontSize: 28, fontWeight: "800" },
  valueUnit: { fontSize: 12, color: LABEL_COLOR },
  metaRow: { flexDirection: "row", gap: 8 },
  metaChip: {
    backgroundColor: "#E2EAF4",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: LABEL_COLOR,
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
    marginTop: 1,
  },

  // Empty
  emptyBox: {
    marginTop: 80,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptySubText: {
    fontSize: 13,
    color: LABEL_COLOR,
    textAlign: "center",
  },
});
