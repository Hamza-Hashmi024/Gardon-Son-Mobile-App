// // app/setup/SetupScreen.tsx
// import { useState } from "react";
// import { View, TextInput, Button, Text, Alert, StyleSheet } from "react-native";
// import { sendDeviceConfig } from "@/app/services/api";

// export default function SetupScreen({ navigation }: any) {
//   const [ssid, setSsid] = useState("");
//   const [password, setPassword] = useState("");
//   const [timezone, setTimezone] = useState("5"); // Default UTC+5

//   const handleSubmit = async () => {
//     try {
//       const response = await sendDeviceConfig(ssid, password, timezone);
//       // Response is HTML, show simple confirmation
//       Alert.alert("Device Setup", "Setup Complete! Device is configured.");
//       navigation.navigate("Dashboard");
//     } catch (error) {
//       Alert.alert("Error", "Unable to configure device.");
//       console.error(error);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>SSID</Text>
//       <TextInput style={styles.input} value={ssid} onChangeText={setSsid} placeholder="Enter SSID" />

//       <Text style={styles.label}>Password</Text>
//       <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter Password" secureTextEntry />

//       <Text style={styles.label}>Timezone</Text>
//       <TextInput style={styles.input} value={timezone} onChangeText={setTimezone} placeholder="Enter timezone" keyboardType="numeric" />

//       <Button title="Save & Continue" onPress={handleSubmit} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: "#fff" },
//   label: { fontSize: 16, marginVertical: 5 },
//   input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 },
// });

import { sendDeviceConfig } from "@/app/services/api";
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

  const handleSubmit = async () => {
    try {
      await sendDeviceConfig(ssid, password, timezone);
      Alert.alert("Device Setup", "Setup Complete! Device is configured.");
      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Error", "Unable to configure device.");
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Device Setup</Text>

        <Text style={styles.label}>SSID</Text>
        <TextInput
          style={styles.input}
          value={ssid}
          onChangeText={setSsid}
          placeholder="Enter WiFi SSID"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter WiFi Password"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <Text style={styles.label}>Timezone</Text>
        <TextInput
          style={styles.input}
          value={timezone}
          onChangeText={setTimezone}
          placeholder="e.g. 5"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },

  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },

  button: {
    marginTop: 25,
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
