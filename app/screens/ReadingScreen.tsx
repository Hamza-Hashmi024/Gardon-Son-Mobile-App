// app/dashboard/ReadingScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
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

    const interval = setInterval(fetchData, 3600 * 1000); // Every hour
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's DLI Readings</Text>
      <FlatList
        data={readings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Time: {item.time}</Text>
            <Text>Value: {item.value}</Text>
            <Text>Date: {item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
});