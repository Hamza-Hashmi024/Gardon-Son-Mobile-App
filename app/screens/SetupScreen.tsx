import { sendDeviceConfig } from "@/services/api";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SetupScreen({ navigation }: any) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState("5");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const result = await sendDeviceConfig(ssid, password, timezone);
      Alert.alert(
        "Device Setup",
        `Setup complete. SSID "${result.storedConfig.ssid}" and timezone "${result.storedConfig.timezone}" are stored on the Garden Sun device.`,
      );
      navigation.replace("Dashboard", { deviceData: result.responseText });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to configure device.";

      Alert.alert("Setup Failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative background accents */}
      <View style={styles.accentTopRight} />
      <View style={styles.accentBottomLeft} />

      <View style={styles.card}>
        {/* Header block */}
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>⚙</Text>
          </View>
          <View>
            <Text style={styles.eyebrow}>CONFIGURATION</Text>
            <Text style={styles.title}>Device Setup</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* SSID */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>NETWORK SSID</Text>
          <TextInput
            style={styles.input}
            value={ssid}
            onChangeText={setSsid}
            placeholder="Enter WiFi SSID"
            placeholderTextColor="#8A9BB0"
          />
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter WiFi Password"
            placeholderTextColor="#8A9BB0"
            secureTextEntry
          />
        </View>

        {/* Timezone */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>UTC OFFSET</Text>
          <TextInput
            style={[styles.input, styles.inputNarrow]}
            value={timezone}
            onChangeText={setTimezone}
            placeholder="e.g. 5"
            keyboardType="numeric"
            placeholderTextColor="#8A9BB0"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Saving..." : "Save & Continue →"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Make sure your device is powered on and nearby.
        </Text>
      </View>
    </View>
  );
}

const NAVY = "#0B1F3A";
const TEAL = "#00C9A7";
const CARD_BG = "#F0F4FA";
const INPUT_BG = "#FFFFFF";
const BORDER = "#D5DDE8";
const LABEL_COLOR = "#5A7290";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    justifyContent: "center",
    padding: 24,
  },

  // Decorative blobs
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

  // Header
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

  // Fields
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: LABEL_COLOR,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: NAVY,
    backgroundColor: INPUT_BG,
    fontWeight: "500",
  },
  inputNarrow: {
    width: 120,
  },

  // Button
  button: {
    marginTop: 8,
    backgroundColor: NAVY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: TEAL,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  buttonText: {
    color: TEAL,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  footerNote: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: LABEL_COLOR,
    fontStyle: "italic",
  },
});
