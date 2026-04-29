import { getHostingerDeviceData } from "@/services/api";
import { extractSetupInfo } from "@/services/extracter";
import { useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
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

// Stage 1: Hostinger file not found yet      → "Connecting to Wi-Fi"
// Stage 2: file exists, wifi_status present  → "Waiting for first DLI"
// Stage 3: dli_history has data              → show readings
type DeviceStatus = "connecting_wifi" | "waiting_dli" | "has_data";

export default function LiveReadingsScreen({ navigation }: any) {
  const route = useRoute();
  const deviceData = (route.params as LiveReadingsRouteParams | undefined)
    ?.deviceData;

  const [readings, setReadings] = useState<DliReading[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [status, setStatus] = useState<DeviceStatus>("connecting_wifi");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Pulsing dot animation
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

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
        // Stage 3 — has readings
        setReadings(data.dli_history);
        setStatus("has_data");
        const now = new Date();
        setLastUpdated(
          now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      } else if (data?.wifi_status) {
        // Stage 2 — file exists, wifi connected, no DLI yet
        setStatus("waiting_dli");
        setReadings([]);
      }
      // if neither, stay on connecting_wifi (stage 1)
    } catch {
      // File not on Hostinger yet — stay on stage 1
      setStatus("connecting_wifi");
    }
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

  const renderStatusCard = () => {
    if (status === "has_data") return null;

    const steps = [
      {
        key: "connecting_wifi",
        label: "Connecting to Wi-Fi",
        sub: "Device is joining your network…",
        done: status === "waiting_dli",
      },
      {
        key: "waiting_dli",
        label: "Waiting for First DLI",
        sub: "Syncing light readings to server…",
        done: false,
      },
    ];

    const activeIndex = status === "connecting_wifi" ? 0 : 1;

    return (
      <View style={styles.statusCard}>
        {/* Animated dot */}
        <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />

        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>Device Starting Up</Text>

          {steps.map((step, i) => {
            const isActive = i === activeIndex;
            const isDone = i < activeIndex;

            return (
              <View key={step.key} style={styles.stepRow}>
                {/* Step indicator */}
                <View
                  style={[
                    styles.stepCircle,
                    isDone && styles.stepCircleDone,
                    isActive && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepCircleText,
                      isDone && styles.stepCircleTextDone,
                      isActive && styles.stepCircleTextActive,
                    ]}
                  >
                    {isDone ? "✓" : `${i + 1}`}
                  </Text>
                </View>

                {/* Step text */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                      isDone && styles.stepLabelDone,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isActive && (
                    <Text style={styles.stepSub}>{step.sub}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
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

      {/* Status stepper (hidden once we have data) */}
      {renderStatusCard()}

      {/* DLI List */}
      {status === "has_data" && (
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
            <Text style={styles.listHeader}>{readings.length} readings</Text>
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
      )}
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

  // Status stepper card
  statusCard: {
    backgroundColor: "#112240",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#1E3A5F",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: TEAL,
    marginTop: 4,
  },
  statusContent: {
    flex: 1,
    gap: 16,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#0B1F3A",
    borderWidth: 1.5,
    borderColor: "#1E3A5F",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    borderColor: TEAL,
    backgroundColor: "#0B1F3A",
  },
  stepCircleDone: {
    borderColor: TEAL,
    backgroundColor: TEAL,
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: "700",
    color: LABEL_COLOR,
  },
  stepCircleTextActive: {
    color: TEAL,
  },
  stepCircleTextDone: {
    color: NAVY,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: LABEL_COLOR,
  },
  stepLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  stepLabelDone: {
    color: TEAL,
  },
  stepSub: {
    fontSize: 11,
    color: LABEL_COLOR,
    marginTop: 2,
  },

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
});