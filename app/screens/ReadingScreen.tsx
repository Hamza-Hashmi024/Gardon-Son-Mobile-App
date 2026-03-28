import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getDeviceJson } from "../services/api";
import { extractSetupInfo } from "../services/extracter";

type DliReading = {
  value: number;
  time: string;
  date: string;
};

type DeviceInfo = {
  mac: string;
  ssid: string;
  timezone: string;
};

export default function ReadingScreen() {
  const [readings, setReadings] = useState<DliReading[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  // 🔹 TEMP: simulate setup response (remove when using navigation)
  useEffect(() => {
    const mockHtml = `
      <strong>AP MAC Address:</strong> F0:24:F9:2C:DA:10
      <strong>WiFi SSID:</strong> Hashmi347
      <strong>Timezone:</strong> 5
    `;

    const parsed = extractSetupInfo(mockHtml);
    setDeviceInfo(parsed);
  }, []);

  // 🔹 Fetch readings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDeviceJson();
        console.log("API DATA:", data);

        if (Array.isArray(data.dli_history)) {
          setReadings(data.dli_history);
        } else if (data.value) {
          setReadings([data]);
        } else {
          setReadings([]);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 3600 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
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

      {/* 🔥 Device Info Section */}
      {deviceInfo && (
        <View style={styles.deviceBox}>
          <Text style={styles.deviceText}>MAC: {deviceInfo.mac}</Text>
          <Text style={styles.deviceText}>SSID: {deviceInfo.ssid}</Text>
          <Text style={styles.deviceText}>Timezone: {deviceInfo.timezone}</Text>
        </View>
      )}

      <FlatList
        data={readings}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No readings yet.</Text>
            <Text style={styles.emptySubText}>
              Data will appear once the device syncs.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>#{index + 1}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.valueRow}>
                <Text style={styles.valueNumber}>{item.value}</Text>
                <Text style={styles.valueUnit}>mol/m²/d</Text>
              </View>

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
  iconText: {
    fontSize: 22,
    color: TEAL,
  },
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

  divider: {
    height: 1,
    backgroundColor: "#1E3A5F",
    marginBottom: 20,
  },

  deviceBox: {
    backgroundColor: "#112240",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  deviceText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 2,
  },

  listContent: {
    paddingBottom: 40,
    gap: 12,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    gap: 14,
    elevation: 5,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEAL,
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
  },
  valueUnit: {
    fontSize: 12,
    color: LABEL_COLOR,
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
  },
  metaChip: {
    backgroundColor: "#E2EAF4",
    borderRadius: 8,
    padding: 8,
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: LABEL_COLOR,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
  },

  emptyBox: {
    marginTop: 80,
    alignItems: "center",
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
