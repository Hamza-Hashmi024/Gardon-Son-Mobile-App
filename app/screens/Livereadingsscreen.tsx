import { BottomPillNavigation } from "@/components/ui/BottomPillNavigation";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radius, spacing, typography } from "@/constants/design";
import { getHostingerDeviceData } from "@/services/api";
import { extractSetupInfo } from "@/services/extracter";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
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
  // Passed when navigating directly from AsyncStorage (skipping setup)
  mac?: string;
};

type DeviceStatus = "connecting_wifi" | "waiting_dli" | "has_data";

export default function LiveReadingsScreen({ navigation }: any) {
  const route = useRoute();
  const params = route.params as LiveReadingsRouteParams | undefined;
  const deviceData = params?.deviceData;
  const routeMac = params?.mac;

  // True when opened from AsyncStorage bypass (no fresh setup HTML available)
  const isRestoredSession = !deviceData && !!routeMac;

  const [readings, setReadings] = useState<DliReading[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [status, setStatus] = useState<DeviceStatus>("connecting_wifi");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Tracks consecutive Hostinger API failures on a restored session
  const apiFailureCount = useRef(0);

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
    } else if (routeMac) {
      // Restored from AsyncStorage — only MAC is available
      setDeviceInfo({ mac: routeMac, ssid: null, timezone: null, jsonPath: null, restartPath: null });
    }
  }, [deviceData, routeMac]);

  const fetchData = async () => {
    if (!deviceInfo?.mac) return;

    try {
      const data = await getHostingerDeviceData(deviceInfo.mac);
      apiFailureCount.current = 0;

      if (Array.isArray(data?.dli_history) && data.dli_history.length > 0) {
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
        setStatus("waiting_dli");
        setReadings([]);
      }
    } catch {
      // On a restored session, persistent failures mean the file is gone — reset
      if (isRestoredSession) {
        apiFailureCount.current += 1;
        if (apiFailureCount.current >= 3) {
          await AsyncStorage.removeItem("deviceJsonFile");
          navigation.replace("Connection");
          return;
        }
      }
      setStatus("connecting_wifi");
    }
  };

  const handleReconfigure = async () => {
    await AsyncStorage.removeItem("deviceJsonFile");
    navigation.replace("Connection");
  };

  const confirmReconfigure = () => {
    Alert.alert(
      "Configure New Device?",
      "You are about to configure a new device. This may replace the current device connection details. Do you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: handleReconfigure,
        },
      ],
    );
  };

  const handleOpenHistory = () => {
    if (!deviceInfo?.mac) return;

    navigation.navigate("History", { mac: deviceInfo.mac });
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

  const renderStatusCard = () => {
    if (status === "has_data") return null;

    const steps = [
      {
        key: "connecting_wifi",
        label: "Connecting to Wi-Fi",
        sub: "Device is joining your network...",
      },
      {
        key: "waiting_dli",
        label: "Waiting for First DLI",
        sub: "Syncing light readings to server...",
      },
    ];

    const activeIndex = status === "connecting_wifi" ? 0 : 1;

    return (
      <AppCard tone="dark" style={styles.statusCard}>
        <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />

        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>Device Starting Up</Text>

          {steps.map((step, i) => {
            const isActive = i === activeIndex;
            const isDone = i < activeIndex;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepCircle,
                    isDone && styles.stepCircleDone,
                    isActive && styles.stepCircleActive,
                  ]}
                >
                  {isDone ? (
                    <Feather name="check" size={14} color={colors.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.stepCircleText,
                        isActive && styles.stepCircleTextActive,
                      ]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </View>

                <View style={styles.stepCopy}>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                      isDone && styles.stepLabelDone,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {isActive && <Text style={styles.stepSub}>{step.sub}</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </AppCard>
    );
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

        {renderStatusCard()}

        {status === "has_data" && (
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
              <Text style={styles.listHeader}>{readings.length} readings</Text>
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
                    <Text style={styles.valueUnit}></Text>
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
        )}

        <BottomPillNavigation
          items={[
            {
              key: "live",
              label: "Live",
              icon: "sun",
              active: true,
              onPress: () => {},
            },
            {
              key: "history",
              label: "History",
              icon: "clock",
              active: false,
              onPress: handleOpenHistory,
            },
            {
              key: "config",
              label: "Config",
              icon: "settings",
              active: false,
              onPress: confirmReconfigure,
            },
          ]}
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
  statusCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
    marginTop: spacing.xs,
  },
  statusContent: {
    flex: 1,
    gap: spacing.lg,
  },
  statusTitle: {
    ...typography.label,
    color: colors.textInverse,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    borderColor: colors.secondary,
  },
  stepCircleDone: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondary,
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  stepCircleTextActive: {
    color: colors.secondary,
  },
  stepCopy: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  stepLabelActive: {
    color: colors.textInverse,
    fontWeight: "700",
  },
  stepLabelDone: {
    color: colors.secondary,
  },
  stepSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  listHeader: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 120,
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
});
