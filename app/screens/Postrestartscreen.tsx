import { checkDeviceConnection } from "@/services/api";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";

type PostRestartRouteParams = {
  deviceData?: string;
};

type Phase = "restarting" | "waiting" | "reconnected" | "failed";

const RESTART_DURATION_MS = 10_000; // initial forced wait
const POLL_INTERVAL_MS = 3_000;
const MAX_POLLS = 20; // ~60s total polling window

export default function PostRestartScreen({ navigation }: any) {
  const route = useRoute();
  const deviceData = (route.params as PostRestartRouteParams | undefined)
    ?.deviceData;

  const [phase, setPhase] = useState<Phase>("restarting");
  const [countdown, setCountdown] = useState(10);
  const [pollCount, setPollCount] = useState(0);

  // Spinning ring animation
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start spinner
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

  // Pulse on reconnected
  useEffect(() => {
    if (phase === "reconnected") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [phase]);

  // Phase 1 — countdown 10→0
  useEffect(() => {
    if (phase !== "restarting") return;
    if (countdown <= 0) {
      setPhase("waiting");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Phase 2 — poll until device responds
  useEffect(() => {
    if (phase !== "waiting") return;

    let cancelled = false;
    let polls = 0;

    const poll = async () => {
      if (cancelled) return;

      if (polls >= MAX_POLLS) {
        setPhase("failed");
        return;
      }

      const ok = await checkDeviceConnection();
      polls++;
      setPollCount(polls);

      if (cancelled) return;

      if (ok) {
        setPhase("reconnected");
        // Auto-navigate after brief celebration
        setTimeout(() => {
          if (!cancelled) {
            navigation.replace("LiveReadings", { deviceData });
          }
        }, 1800);
      } else {
        setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const retry = () => {
    setPollCount(0);
    setCountdown(10);
    setPhase("restarting");
  };

  return (
    <View style={styles.container}>
      <View style={styles.accentTopRight} />
      <View style={styles.accentBottomLeft} />

      <View style={styles.card}>
        {/* Icon area */}
        <View style={styles.iconWrap}>
          {phase === "reconnected" ? (
            <Animated.View
              style={[styles.iconCircle, styles.iconCircleSuccess, { transform: [{ scale: pulseAnim }] }]}
            >
              <Text style={styles.iconEmoji}>✓</Text>
            </Animated.View>
          ) : phase === "failed" ? (
            <View style={[styles.iconCircle, styles.iconCircleFail]}>
              <Text style={styles.iconEmoji}>✕</Text>
            </View>
          ) : (
            <View style={styles.spinnerWrap}>
              <Animated.View
                style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}
              />
              <View style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>⟳</Text>
              </View>
            </View>
          )}
        </View>

        {/* Title + subtitle */}
        <Text style={styles.eyebrow}>DEVICE RESTART</Text>
        <Text style={styles.title}>
          {phase === "restarting" && "Restarting Device"}
          {phase === "waiting" && "Waiting for Device"}
          {phase === "reconnected" && "Device Online!"}
          {phase === "failed" && "Connection Timeout"}
        </Text>

        <View style={styles.divider} />

        {/* Body message */}
        {phase === "restarting" && (
          <>
            <Text style={styles.message}>
              The device is restarting. Please wait…
            </Text>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown}</Text>
              <Text style={styles.countdownLabel}>seconds remaining</Text>
            </View>
          </>
        )}

        {phase === "waiting" && (
          <>
            <Text style={styles.message}>
              Checking if your Garden Sun device is back online…
            </Text>
            <View style={styles.pollRow}>
              {Array.from({ length: Math.min(pollCount, 5) }).map((_, i) => (
                <View key={i} style={styles.pollDot} />
              ))}
              {Array.from({ length: Math.max(0, 5 - Math.min(pollCount, 5)) }).map((_, i) => (
                <View key={`e${i}`} style={[styles.pollDot, styles.pollDotEmpty]} />
              ))}
            </View>
            <Text style={styles.pollSubtext}>
              Attempt {pollCount} of {MAX_POLLS}
            </Text>
          </>
        )}

        {phase === "reconnected" && (
          <Text style={styles.messageSuccess}>
            Device is back online. Loading your readings…
          </Text>
        )}

        {phase === "failed" && (
          <>
            <Text style={styles.messageFail}>
              Could not reach the device after{" "}
              {Math.round((MAX_POLLS * POLL_INTERVAL_MS) / 1000)} seconds. Make
              sure your phone is still connected to the Garden Sun Wi-Fi.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={retry}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => navigation.replace("LiveReadings", { deviceData })}
            >
              <Text style={styles.skipBtnText}>Go to Readings Anyway →</Text>
            </TouchableOpacity>
          </>
        )}
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

  // Icon
  iconWrap: {
    marginBottom: 22,
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    width: 80,
  },
  spinnerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
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
  iconCircleSuccess: {
    backgroundColor: "#0F2D1A",
    borderWidth: 2,
    borderColor: TEAL,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  iconCircleFail: {
    backgroundColor: "#2D0F0F",
    borderWidth: 2,
    borderColor: "#EF4444",
    width: 80,
    height: 80,
    borderRadius: 40,
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
  messageSuccess: {
    fontSize: 14,
    color: "#00C9A7",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 21,
  },
  messageFail: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },

  // Countdown
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

  // Poll dots
  pollRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  pollDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: TEAL,
  },
  pollDotEmpty: {
    backgroundColor: BORDER,
  },
  pollSubtext: {
    fontSize: 11,
    color: LABEL_COLOR,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  // Buttons
  retryBtn: {
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: TEAL,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  retryBtnText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: "800",
  },
  skipBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  skipBtnText: {
    color: LABEL_COLOR,
    fontSize: 13,
    fontWeight: "600",
  },
});