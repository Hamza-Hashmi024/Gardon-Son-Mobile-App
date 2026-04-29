import { AppCard } from "@/components/ui/AppCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { colors, spacing, typography } from "@/constants/design";
import { Feather } from "@expo/vector-icons";
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

  // Countdown tick, then navigate when it hits 0.
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
    <ScreenBackground>
      <View style={styles.container}>
        <AppCard style={styles.card}>
        <View style={styles.spinnerWrap}>
          <Animated.View
            style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}
          />
          <View style={styles.iconCircle}>
            <Feather name="refresh-cw" size={28} color={colors.secondary} />
          </View>
        </View>

        <Text style={styles.eyebrow}>DEVICE RESTART</Text>
        <Text style={styles.title}>Restarting Device</Text>

        <View style={styles.divider} />

        <Text style={styles.message}>
          The device is restarting. Please wait...
        </Text>

        <View style={styles.countdownBox}>
          <Text style={styles.countdownNumber}>{countdown}</Text>
          <Text style={styles.countdownLabel}>seconds remaining</Text>
        </View>
        </AppCard>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.screen,
  },
  card: {
    alignItems: "center",
  },
  spinnerWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    marginBottom: spacing.xl,
  },
  spinnerRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.secondary,
    borderTopColor: "transparent",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: "100%",
    marginBottom: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  countdownBox: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    paddingHorizontal: 36,
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.secondary,
    lineHeight: 54,
  },
  countdownLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: 2,
  },
});
