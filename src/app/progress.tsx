import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import { bucketProgress } from "@/algorithms/progressAlgorithm";
import BottomNav from "@/components/custom/BottomNav";
import CalorieBurnedCard from "@/components/custom/CalorieBurnedCard";
import Header from "@/components/custom/Header";
import InfoDialog from "@/components/custom/InfoDialog";
import ScreenContent from "@/components/wrappers/ScreenWrapper";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getExerciseSetHistory, getLoggedExerciseNames, getWeeklyWorkoutFrequency } from "@/db/progress";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useAppTheme } from "@/theme/ThemeProvider";
import { ThemeTokens } from "@/theme/tokens";

const CHART_WIDTH = Dimensions.get("window").width - Spacing.screenHorizontal * 2 - 32;

type Granularity = "week" | "month";

const getChartConfig = (colors: ThemeTokens) => ({
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(18, 99, 223, ${opacity})`,
    labelColor: () => colors.textSecondary,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#1263df" },
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: "4" },
    fillShadowGradient: "#1263df",
    fillShadowGradientOpacity: 0.15,
});

export default function ProgressScreen() {
    const { colors } = useAppTheme();
    const chartConfig = useMemo(() => getChartConfig(colors), [colors]);
    const [exerciseNames, setExerciseNames] = useState<string[]>(() => getLoggedExerciseNames());
    const [selectedExercise, setSelectedExercise] = useState<string | null>(exerciseNames[0] ?? null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [granularity, setGranularity] = useState<Granularity>("week");
    const [frequency, setFrequency] = useState(() => getWeeklyWorkoutFrequency(4));
    const [show1RMInfo, setShow1RMInfo] = useState(false);

    useFocusRefresh(() => {
        const names = getLoggedExerciseNames();
        setExerciseNames(names);
        setSelectedExercise((prev) => (prev && names.includes(prev) ? prev : names[0] ?? null));
        setFrequency(getWeeklyWorkoutFrequency(4));
    });

    const setRows = useMemo(
        () => (selectedExercise ? getExerciseSetHistory(selectedExercise) : []),
        [selectedExercise]
    );

    const buckets = useMemo(() => bucketProgress(setRows, granularity, 6), [setRows, granularity]);

    const trendPercent = useMemo(() => {
        const nonEmpty = buckets.filter((b) => b.estimated1RM > 0);
        if (nonEmpty.length < 2) return null;
        const last = nonEmpty[nonEmpty.length - 1].estimated1RM;
        const prev = nonEmpty[nonEmpty.length - 2].estimated1RM;
        if (prev === 0) return null;
        return Math.round(((last - prev) / prev) * 100);
    }, [buckets]);

    const latestEstimated1RM = buckets.length > 0 ? buckets[buckets.length - 1].estimated1RM : 0;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenContent>
                <Header />

                <Text style={{ color: colors.textPrimary, fontSize: 26, fontFamily: Fonts.bold, marginTop: 16, marginBottom: 16 }}>
                    Strength Progress
                </Text>

                {exerciseNames.length === 0 ? (
                    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                            Log a workout to see your progress here.
                        </Text>
                    </View>
                ) : (
                    <View style={{ gap: 16 }}>
                        <View>
                            <Pressable
                                onPress={() => setPickerOpen((prev) => !prev)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundColor: colors.surface,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.medium }}>
                                    {selectedExercise}
                                </Text>
                                <Ionicons name={pickerOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.textPrimary} />
                            </Pressable>

                            {pickerOpen ? (
                                <View
                                    style={{
                                        backgroundColor: colors.surface,
                                        borderRadius: 14,
                                        marginTop: 8,
                                        overflow: "hidden",
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                >
                                    {exerciseNames.map((name) => (
                                        <Pressable
                                            key={name}
                                            onPress={() => {
                                                setSelectedExercise(name);
                                                setPickerOpen(false);
                                            }}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 12,
                                                backgroundColor: name === selectedExercise ? colors.tintBlueBg : colors.surface,
                                            }}
                                        >
                                            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.regular }}>
                                                {name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 12 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: "row", backgroundColor: colors.surfaceMuted, borderRadius: 16, padding: 2 }}>
                                    {(["week", "month"] as Granularity[]).map((option) => {
                                        const selected = option === granularity;
                                        return (
                                            <Pressable
                                                key={option}
                                                onPress={() => setGranularity(option)}
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 5,
                                                    borderRadius: 14,
                                                    backgroundColor: selected ? colors.surface : "transparent",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 11,
                                                        color: selected ? colors.textPrimary : colors.textSecondary,
                                                        fontFamily: selected ? Fonts.bold : Fonts.medium,
                                                    }}
                                                >
                                                    {option === "week" ? "Week" : "Month"}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                {trendPercent !== null ? (
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 4,
                                            backgroundColor: "#fff3ee",
                                            borderRadius: 12,
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                        }}
                                    >
                                        <Ionicons
                                            name={trendPercent >= 0 ? "trending-up" : "trending-down"}
                                            size={12}
                                            color="#ee6d3a"
                                        />
                                        <Text style={{ color: "#a45337", fontSize: 11, fontFamily: Fonts.bold }}>
                                            {trendPercent >= 0 ? "+" : ""}
                                            {trendPercent}% this {granularity}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            <View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                        Estimated 1RM
                                    </Text>
                                    <Pressable onPress={() => setShow1RMInfo(true)} hitSlop={8}>
                                        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
                                    </Pressable>
                                </View>
                                <Text style={{ color: colors.textPrimary, fontSize: 30, fontFamily: Fonts.bold }}>
                                    {latestEstimated1RM} kg
                                </Text>
                            </View>

                            <LineChart
                                data={{
                                    labels: buckets.map((b) => b.label),
                                    datasets: [{ data: buckets.map((b) => b.estimated1RM) }],
                                }}
                                width={CHART_WIDTH}
                                height={180}
                                bezier
                                chartConfig={chartConfig}
                                withInnerLines
                                withOuterLines={false}
                                withShadow={false}
                                style={{ marginLeft: -16, borderRadius: 16 }}
                            />
                        </View>

                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <CalorieBurnedCard period="today" backgroundColor={colors.tintBlueBg} />
                            <CalorieBurnedCard period="week" backgroundColor={colors.surfaceMuted} />
                        </View>

                        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 12 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                                    Workout Frequency
                                </Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                    Last 4 weeks
                                </Text>
                            </View>

                            <BarChart
                                data={{
                                    labels: frequency.map((f) => f.label),
                                    datasets: [{ data: frequency.map((f) => f.count) }],
                                }}
                                width={CHART_WIDTH}
                                height={160}
                                chartConfig={chartConfig}
                                fromZero
                                withInnerLines={false}
                                yAxisLabel=""
                                yAxisSuffix=""
                                style={{ marginLeft: -16, borderRadius: 16 }}
                            />
                        </View>
                    </View>
                )}
            </ScreenContent>
            <BottomNav />

            <InfoDialog
                visible={show1RMInfo}
                title="What is 1RM?"
                message="Your estimated one-rep max — the heaviest weight you could probably lift for a single rep, calculated from your logged sets. It's a way to track how much stronger you're getting, even though you never actually attempt a true 1-rep lift."
                onClose={() => setShow1RMInfo(false)}
            />
        </SafeAreaView>
    );
}
