import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useAppTheme } from "../../lib/theme";
import { useEffect } from "react";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const theme = useAppTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius, backgroundColor: theme.border },
        animStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={skStyles.card}>
      <View style={skStyles.row}>
        <Skeleton
          width={40}
          height={40}
          borderRadius={20}
        />
        <View style={skStyles.col}>
          <Skeleton
            width="60%"
            height={14}
          />
          <Skeleton
            width="40%"
            height={12}
          />
        </View>
      </View>
      <Skeleton
        width="100%"
        height={14}
      />
      <Skeleton
        width="80%"
        height={14}
      />
      <View style={skStyles.row}>
        <Skeleton
          width={60}
          height={12}
        />
        <Skeleton
          width={40}
          height={12}
        />
        <Skeleton
          width={50}
          height={12}
        />
      </View>
    </View>
  );
}

const skStyles = StyleSheet.create({
  card: { padding: 14, gap: 10 },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },
  col: { flex: 1, gap: 6 },
});

export function SkeletonContributionGraph() {
  return (
    <View style={contribStyles.contribContainer}>
      <Skeleton
        width="40%"
        height={12}
      />
      <View style={contribStyles.contribGraph}>
        {Array.from({ length: 53 }).map((_, wi) => (
          <View
            key={wi}
            style={contribStyles.contribWeek}
          >
            {Array.from({ length: 7 }).map((_, di) => (
              <Skeleton
                key={di}
                width={11}
                height={11}
                borderRadius={2}
                style={contribStyles.contribCell}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const contribStyles = StyleSheet.create({
  contribContainer: { paddingHorizontal: 16, paddingTop: 12 },
  contribGraph: { flexDirection: "row", gap: 3 },
  contribWeek: { flexDirection: "column", gap: 3 },
  contribCell: { width: 11, height: 11, borderRadius: 2 },
});
