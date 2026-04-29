import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";

type PostRestartRouteParams = {
  deviceData?: string;
};

const COUNTDOWN_FROM = 20;

export default function PostRestartScreen({ navigation }: any) {
  const route = useRoute();
  const deviceData = (route.params as PostRestartRouteParams | undefined)
    ?.deviceData;

  const [countdown, setCountdown] = useState(COUNTDOWN_FROM);

  const spinAnim = useRef(new Animated.Value(0)).current;

  // Spinner loop
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  // Countdown tick — navigate when it hits 0
  useEffect(() => {
    if (countdown <= 0) {
      navigation.replace("LiveReadings", { deviceData });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.accentTopRight} />
      <View style={styles.accentBottomLeft} />

      <View style={styles.card}>
        {/* Spinner */}
        <View style={styles.spinnerWrap}>
          <Animated.View
            style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}
          />
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>⟳</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>DEVICE RESTART</Text>
        <Text style={styles.title}>Restarting Device</Text>

        <View style={styles.divider} />

        <Text style={styles.message}>
          The device is restarting. Please wait…
        </Text>

        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownLabel}>seconds remaining</Text>
        </View>
      </View>
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
    justifyContent: "center",
    padding: 28,
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
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  spinnerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    marginBottom: 22,
  },
  spinnerRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: TEAL,
    borderTopColor: "transparent",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 28,
    color: TEAL,
    fontWeight: "800",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: TEAL,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.3,
    marginBottom: 16,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    width: "100%",
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: LABEL_COLOR,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },
  countdownBox: {
    alignItems: "center",
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderWidth: 1.5,
    borderColor: TEAL,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: TEAL,
    lineHeight: 54,
  },
  countdownLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: LABEL_COLOR,
    letterSpacing: 1.2,
    marginTop: 2,
  },
});