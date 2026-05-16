import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { colors, radius, spacing, typography } from "@/constants/design";
import { getHostingerDeviceHistory } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
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

type HistoryRouteParams = {
  mac?: string;
};

type HistoryStatus = "loading" | "ready" | "empty" | "error";

export default function HistoryScreen({ navigation }: any) {
  const route = useRoute();
  const routeMac = (route.params as HistoryRouteParams | undefined)?.mac;

  const [mac, setMac] = useState<string | null>(routeMac ?? null);
  const [readings, setReadings] = useState<DliReading[]>([]);
  const [status, setStatus] = useState<HistoryStatus>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredMac = async () => {
      if (routeMac) return;

      const deviceJsonFile = await AsyncStorage.getItem("deviceJsonFile");
      const storedMac = deviceJsonFile?.replace(/\.json$/i, "") ?? null;
      setMac(storedMac);

      if (!storedMac) {
        setStatus("error");
        setErrorMessage("No device MAC address found.");
      }
    };

    loadStoredMac();
  }, [routeMac]);

  const fetchHistory = useCallback(async () => {
    if (!mac) {
      setStatus("error");
      setErrorMessage("No device MAC address found.");
      return;
    }

    try {
      setErrorMessage("");
      const data = await getHostingerDeviceHistory(mac);
      const nextReadings = Array.isArray(data?.dli_history)
        ? data.dli_history
        : [];

      setReadings(nextReadings);
      setLastUpdated(data?.last_updated ?? null);
      setStatus(nextReadings.length > 0 ? "ready" : "empty");
    } catch {
      setStatus("error");
      setReadings([]);
      setErrorMessage("Reading history is not available yet.");
    }
  }, [mac]);

  useEffect(() => {
    if (!mac) return;
    fetchHistory();
  }, [fetchHistory, mac]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
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

  const renderStateCard = () => {
    if (status === "ready") return null;

    const message =
      status === "loading"
        ? "Loading reading history..."
        : status === "empty"
          ? "No history readings found yet."
          : errorMessage;

    return (
      <AppCard tone="dark" style={styles.stateCard}>
        <Text style={styles.stateMessage}>{message}</Text>
        {status === "error" && (
          <AppButton
            title="Retry"
            icon="refresh-cw"
            onPress={fetchHistory}
            style={styles.retryButton}
          />
        )}
      </AppCard>
    );
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <ScreenHeader
          eyebrow="READING HISTORY"
          title="History"
          icon="clock"
          inverted
          trailing={
            lastUpdated ? (
              <View style={styles.lastUpdatedBadge}>
                <Text style={styles.lastUpdatedText}>{lastUpdated}</Text>
              </View>
            ) : null
          }
        />

        <AppButton
          title="Back to Live"
          icon="arrow-left"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />

        <View style={styles.divider} />

        {renderStateCard()}

        {status === "ready" && (
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
            keyExtractor={(item, index) =>
              `${item.date ?? "no-date"}-${item.time ?? "no-time"}-${item.value}-${index}`
            }
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
  },
  lastUpdatedText: {
    fontSize: 11,
    color: colors.secondary,
    fontWeight: "700",
  },
  backButton: {
    marginBottom: spacing.md,
  },
  stateCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  stateMessage: {
    ...typography.subtitle,
    color: colors.textInverse,
    textAlign: "center",
  },
  retryButton: {
    alignSelf: "stretch",
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
});
