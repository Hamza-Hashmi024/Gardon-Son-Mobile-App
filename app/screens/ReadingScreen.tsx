// import { getHostingerDeviceData } from "@/services/api";
// import { extractSetupInfo } from "@/services/extracter";
// import { useRoute } from "@react-navigation/native";
// import { useEffect, useState } from "react";
// import { FlatList, StyleSheet, Text, View } from "react-native";

// type DliReading = {
//   value: number;
//   time: string;
//   date: string;
// };

// type DeviceInfo = {
//   mac: string | null;
//   ssid: string | null;
//   timezone: string | null;
//   jsonPath: string | null;
//   restartPath: string | null;
// };

// type ReadingRouteParams = {
//   deviceData?: string;
// };

// export default function ReadingScreen() {
//   const route = useRoute();
//   const deviceData = (route.params as ReadingRouteParams | undefined)
//     ?.deviceData;
//   const [readings, setReadings] = useState<DliReading[]>([]);
//   const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   useEffect(() => {
//     if (deviceData) {
//       const parsed = extractSetupInfo(deviceData);
//       setDeviceInfo(parsed);
//     }
//   }, [deviceData]);

//   // 🔹 Fetch readings
//   useEffect(() => {
//     if (!deviceInfo?.mac) return;

//     const fetchData = async () => {
//       try {
//         const data = await getHostingerDeviceData(deviceInfo.mac);

//         if (Array.isArray(data?.dli_history)) {
//           setReadings(data.dli_history);
//         } else if (data?.wifi_status) {
//           console.log("Device connected:", data.wifi_status);
//           setReadings([]);
//         } else {
//           setReadings([]);
//         }
//       } catch (error) {
//         console.error("Fetch error:", error);
//       }
//     };

//     fetchData();

//     const interval = setInterval(fetchData, 5000); // 🔥 NOT 1 hour

//     return () => clearInterval(interval);
//   }, [deviceInfo?.mac]);

//   const onRefresh = async () => {
//     if (!deviceInfo?.mac) return;

//     setRefreshing(true);

//     try {
//       const data = await getHostingerDeviceData(deviceInfo.mac);

//       if (Array.isArray(data?.dli_history)) {
//         setReadings(data.dli_history);
//       } else if (data?.wifi_status) {
//         setReadings([]); // initial state
//       }
//     } catch (error) {
//       console.error("Refresh error:", error);
//     }

//     setRefreshing(false);
//   };
//   return (
//     <View style={styles.container}>
//       <View style={styles.accentTopRight} />
//       <View style={styles.accentBottomLeft} />

//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.iconBox}>
//           <Text style={styles.iconText}>☀</Text>
//         </View>
//         <View>
//           <Text style={styles.eyebrow}>LIVE MONITORING</Text>
//           <Text style={styles.title}>DLI Readings</Text>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       <Text>Setup Device </Text>
//       {deviceInfo && (
//         <View style={styles.deviceBox}>
//           <Text style={styles.deviceText}> {deviceInfo.mac}</Text>
//           <Text style={styles.deviceText}>SSID: {deviceInfo.ssid}</Text>
//           <Text style={styles.deviceText}>Timezone: {deviceInfo.timezone}</Text>

//           {/* Buttons */}
//           <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
//             {deviceInfo.jsonPath && (
//               <Text
//                 style={styles.button}
//                 onPress={() => {
//                   // Open JSON file in browser (or WebView)
//                   const url = `http://192.168.4.1${deviceInfo.jsonPath}`;
//                   console.log("Open JSON:", url);
//                   // use Linking API to open in default browser
//                   import("react-native").then(({ Linking }) =>
//                     Linking.openURL(url),
//                   );
//                 }}
//               >
//                 View JSON
//               </Text>
//             )}

//             {deviceInfo.restartPath && (
//               <Text
//                 style={[styles.button, { backgroundColor: "#2196F3" }]}
//                 onPress={async () => {
//                   console.log("🔴 Restart Device button pressed");
//                   console.log("Restart path:", deviceInfo.restartPath);

//                   try {
//                     const restartUrl = `http://192.168.4.1${deviceInfo.restartPath}`;
//                     console.log("📡 Sending restart request to:", restartUrl);

//                     // const response = await fetch(restartUrl, {
//                     //   method: "POST",
//                     // });

//                     const response = await fetch(restartUrl, {
//                       method: "POST",
//                       headers: {
//                         "Content-Type": "application/x-www-form-urlencoded",
//                       },
//                       body: "restart=true",
//                     });

//                     const text = await response.text();
//                     console.log("Restart response text:", text);

//                     // device ko upload + restart ke liye time do
//                     await new Promise((resolve) => setTimeout(resolve, 10000));
//                     console.log("✅ Restart response status:", response);
//                     console.log("Response text:", response.statusText);

//                     alert("Device Restarted!");
//                     console.log("✨ Device restart successful");
//                   } catch (err) {
//                     console.log("❌ Restart failed with error:", err);
//                     alert("Failed to restart device.");
//                   }
//                 }}
//               >
//                 Restart Device
//               </Text>
//             )}
//           </View>
//         </View>
//       )}

//       {deviceInfo && readings.length === 0 && (
//         <Text style={{ color: "white", textAlign: "center", marginBottom: 10 }}>
//           Device Connected. Waiting for data...
//         </Text>
//       )}
//       <FlatList
//         data={readings}
//         refreshing={refreshing}
//         onRefresh={onRefresh}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyBox}>
//             <Text style={styles.emptyText}>No readings yet.</Text>
//             <Text style={styles.emptySubText}>
//               Data will appear once the device syncs.
//             </Text>
//           </View>
//         }
//         renderItem={({ item, index }) => (
//           <View style={styles.card}>
//             <View style={styles.indexBadge}>
//               <Text style={styles.indexText}>#{index + 1}</Text>
//             </View>

//             <View style={styles.cardBody}>
//               <View style={styles.valueRow}>
//                 <Text style={styles.valueNumber}>{item.value}</Text>
//                 <Text style={styles.valueUnit}>mol/m²/d</Text>
//               </View>

//               <View style={styles.metaRow}>
//                 <View style={styles.metaChip}>
//                   <Text style={styles.metaLabel}>TIME</Text>
//                   <Text style={styles.metaValue}>{item.time}</Text>
//                 </View>
//                 <View style={styles.metaChip}>
//                   <Text style={styles.metaLabel}>DATE</Text>
//                   <Text style={styles.metaValue}>{item.date || "-"}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         )}
//       />
//     </View>
//   );
// }

// const NAVY = "#0B1F3A";
// const TEAL = "#00C9A7";
// const CARD_BG = "#F0F4FA";
// const LABEL_COLOR = "#5A7290";

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: NAVY,
//     paddingTop: 56,
//     paddingHorizontal: 20,
//   },

//   accentTopRight: {
//     position: "absolute",
//     top: -60,
//     right: -60,
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: TEAL,
//     opacity: 0.12,
//   },
//   accentBottomLeft: {
//     position: "absolute",
//     bottom: -80,
//     left: -80,
//     width: 260,
//     height: 260,
//     borderRadius: 130,
//     backgroundColor: "#3B82F6",
//     opacity: 0.1,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     marginBottom: 20,
//   },
//   iconBox: {
//     width: 48,
//     height: 48,
//     borderRadius: 14,
//     backgroundColor: "#112240",
//     borderWidth: 1.5,
//     borderColor: TEAL,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   iconText: {
//     fontSize: 22,
//     color: TEAL,
//   },
//   eyebrow: {
//     fontSize: 10,
//     fontWeight: "700",
//     letterSpacing: 2,
//     color: TEAL,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#FFFFFF",
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#1E3A5F",
//     marginBottom: 20,
//   },

//   deviceBox: {
//     backgroundColor: "#112240",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 16,
//   },
//   deviceText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     marginBottom: 2,
//   },
//   button: {
//     backgroundColor: TEAL,
//     color: NAVY,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     overflow: "hidden",
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   listContent: {
//     paddingBottom: 40,
//     gap: 12,
//   },

//   card: {
//     backgroundColor: CARD_BG,
//     borderRadius: 18,
//     padding: 18,
//     flexDirection: "row",
//     gap: 14,
//     elevation: 5,
//   },
//   indexBadge: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: NAVY,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   indexText: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: TEAL,
//   },
//   cardBody: {
//     flex: 1,
//     gap: 10,
//   },
//   valueRow: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     gap: 6,
//   },
//   valueNumber: {
//     fontSize: 28,
//     fontWeight: "800",
//     color: NAVY,
//   },
//   valueUnit: {
//     fontSize: 12,
//     color: LABEL_COLOR,
//   },
//   metaRow: {
//     flexDirection: "row",
//     gap: 10,
//   },
//   metaChip: {
//     backgroundColor: "#E2EAF4",
//     borderRadius: 8,
//     padding: 8,
//     flex: 1,
//   },
//   metaLabel: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: LABEL_COLOR,
//   },
//   metaValue: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: NAVY,
//   },

//   emptyBox: {
//     marginTop: 80,
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#FFFFFF",
//   },
//   emptySubText: {
//     fontSize: 13,
//     color: LABEL_COLOR,
//     textAlign: "center",
//   },
// });
import { getHostingerDeviceData } from "@/services/api";
import { extractSetupInfo } from "@/services/extracter";
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
    } catch (error) {
      console.error("Fetch error:", error);
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
        {lastUpdated && (
          <View style={styles.lastUpdatedBadge}>
            <Text style={styles.lastUpdatedText}>↻ {lastUpdated}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Device Info Box */}
      {deviceInfo && (
        <View style={styles.deviceBox}>
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
            <Text style={styles.deviceValue}>{deviceInfo.timezone}</Text>
          </View>

          <View style={styles.buttonRow}>
            {deviceInfo.jsonPath && (
              <Text
                style={styles.button}
                onPress={() => {
                  const url = `http://192.168.4.1${deviceInfo.jsonPath}`;
                  import("react-native").then(({ Linking }) =>
                    Linking.openURL(url),
                  );
                }}
              >
                View JSON
              </Text>
            )}
            {deviceInfo.restartPath && (
              <Text
                style={[styles.button, { backgroundColor: "#2196F3" }]}
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
                  } catch (_err) {
                    // Device may close the connection on restart — that's fine
                  } finally {
                    navigation.replace("PostRestart", { deviceData });
                  }
                }}
              >
                Restart Device
              </Text>
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
            {wifiStatus && <Text style={styles.wifiSub}>{wifiStatus}</Text>}
            <Text style={styles.wifiSub}>Waiting for first DLI reading...</Text>
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
              <Text style={styles.emptyText}>No readings yet.</Text>
              <Text style={styles.emptySubText}>
                Data will appear once the device syncs.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            {/* Index badge */}
            <View style={styles.indexBadge}>
              <Text style={styles.indexText}>#{index + 1}</Text>
            </View>

            {/* Value */}
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

              {/* Time / Date chips — only shown if present */}
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
    flexWrap: "wrap",
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
    marginLeft: "auto",
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
    marginBottom: 16,
  },

  // Device box
  deviceBox: {
    backgroundColor: "#112240",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 4,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deviceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: TEAL,
    width: 36,
    letterSpacing: 1,
  },
  deviceValue: {
    fontSize: 12,
    color: "#FFFFFF",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: TEAL,
    color: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
    fontSize: 13,
    fontWeight: "700",
  },

  // WiFi connected state
  wifiCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#0F2D1A",
    borderWidth: 1,
    borderColor: "#00C9A7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  wifiDot: {
    fontSize: 14,
    color: TEAL,
    marginTop: 1,
  },
  wifiTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  wifiSub: {
    fontSize: 12,
    color: LABEL_COLOR,
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
  indexText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEAL,
  },
  cardBody: {
    flex: 1,
    gap: 8,
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
    color: LABEL_COLOR,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
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
    color: LABEL_COLOR,
    letterSpacing: 0.8,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: "600",
    color: NAVY,
    marginTop: 1,
  },

  // Empty state
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
    marginTop: 4,
  },
});