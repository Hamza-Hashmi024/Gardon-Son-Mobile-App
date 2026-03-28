import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getDeviceJson } from "../services/api";

type DliReading = {
  value: number;
  time: string;
  date: string;
};

export default function ReadingScreen() {
  const [readings, setReadings] = useState<DliReading[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDeviceJson();
        setReadings(data.dli_history || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 3600 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative accents */}
      <View style={styles.accentTopRight} />
      <View style={styles.accentBottomLeft} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>☀</Text>
        </View>
        <View>
          <Text style={styles.eyebrow}>LIVE MONITORING</Text>
          <Text style={styles.title}>DLI Readings</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <FlatList
        data={readings}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyText}>No readings yet.</Text>
            <Text style={styles.emptySubText}>
              Data will appear once the device syncs.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Index badge */}
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>#{index + 1}</Text>
            </View>

            <View style={styles.cardBody}>
              {/* Value — highlighted prominently */}
              <View style={styles.valueRow}>
                <Text style={styles.valueNumber}>{item.value}</Text>
                <Text style={styles.valueUnit}>mol/m²/d</Text>
              </View>

              {/* Time & Date row */}
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaLabel}>TIME</Text>
                  <Text style={styles.metaValue}>{item.time}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaLabel}>DATE</Text>
                  <Text style={styles.metaValue}>{item.date}</Text>
                </View>
              </View>
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
const BORDER = "#D5DDE8";
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
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  divider: {
    height: 1,
    backgroundColor: "#1E3A5F",
    marginBottom: 20,
  },

  listContent: {
    paddingBottom: 40,
    gap: 12,
  },

  // Card
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEAL,
    letterSpacing: 0.5,
  },
  cardBody: {
    flex: 1,
    gap: 10,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  valueNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.5,
  },
  valueUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: LABEL_COLOR,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
  },
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
    letterSpacing: 1.5,
    color: LABEL_COLOR,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },

  // Empty state
  emptyBox: {
    marginTop: 80,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
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
