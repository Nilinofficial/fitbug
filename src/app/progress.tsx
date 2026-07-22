import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

import { bucketProgress, estimateOneRepMax } from "@/algorithms/progressAlgorithm";
import Header from "@/components/custom/Header";
import BottomNav from "@/components/custom/BottomNav";
import ScreenContent from "@/components/wrappers/ScreenWrapper";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getExerciseSetHistory, getLoggedExerciseNames, getWeeklyWorkoutFrequency } from "@/db/progress";
import { formatDate } from "@/lib/format";

const CHART_WIDTH = Dimensions.get("window").width - Spacing.screenHorizontal * 2 - 32;

type Granularity = "week" | "month";

const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(18, 99, 223, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(149, 153, 165, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#1263df" },
    propsForBackgroundLines: { stroke: "#E4E6ED", strokeDasharray: "4" },
    fillShadowGradient: "#1263df",
    fillShadowGradientOpacity: 0.15,
};

export default function ProgressScreen() {
    const [exerciseNames, setExerciseNames] = useState<string[]>(() => getLoggedExerciseNames());
    const [selectedExercise, setSelectedExercise] = useState<string | null>(exerciseNames[0] ?? null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [granularity, setGranularity] = useState<Granularity>("week");
    const [frequency, setFrequency] = useState(() => getWeeklyWorkoutFrequency(4));

    useFocusEffect(
        useCallback(() => {
            const names = getLoggedExerciseNames();
            setExerciseNames(names);
            setSelectedExercise((prev) => (prev && names.includes(prev) ? prev : names[0] ?? null));
            setFrequency(getWeeklyWorkoutFrequency(4));
        }, [])
    );

    const setRows = useMemo(
        () => (selectedExercise ? getExerciseSetHistory(selectedExercise) : []),
        [selectedExercise]
    );

    const buckets = useMemo(() => bucketProgress(setRows, granularity, 6), [setRows, granularity]);

    const personalRecord = useMemo(() => {
        if (setRows.length === 0) return null;
        let best = { value: 0, date: setRows[0].date };
        for (const row of setRows) {
            const oneRm = estimateOneRepMax(row.weightKg, row.reps);
            if (oneRm > best.value) best = { value: oneRm, date: row.date };
        }
        return best;
    }, [setRows]);

    const monthlyVolume = useMemo(() => {
        const now = new Date();
        const rowsThisMonth = setRows.filter((row) => {
            const d = new Date(row.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        const volume = rowsThisMonth.reduce((sum, row) => sum + row.weightKg * row.reps, 0);
        const workoutCount = new Set(rowsThisMonth.map((row) => row.date)).size;
        return { volume, workoutCount };
    }, [setRows]);

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
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
            <ScreenContent>
                <Header />

                <Text style={{ color: "#20242d", fontSize: 26, fontFamily: Fonts.bold, marginTop: 16, marginBottom: 16 }}>
                    Strength Progress
                </Text>

                {exerciseNames.length === 0 ? (
                    <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16 }}>
                        <Text style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}>
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
                                    backgroundColor: "#ffffff",
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    borderColor: "#E4E6ED",
                                    paddingHorizontal: 16,
                                    paddingVertical: 14,
                                }}
                            >
                                <Text style={{ color: "#20242d", fontSize: 15, fontFamily: Fonts.medium }}>
                                    {selectedExercise}
                                </Text>
                                <Ionicons name={pickerOpen ? "chevron-up" : "chevron-down"} size={18} color="#20242d" />
                            </Pressable>

                            {pickerOpen ? (
                                <View
                                    style={{
                                        backgroundColor: "#ffffff",
                                        borderRadius: 14,
                                        marginTop: 8,
                                        overflow: "hidden",
                                        borderWidth: 1,
                                        borderColor: "#E4E6ED",
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
                                                backgroundColor: name === selectedExercise ? "#EAF1FE" : "#ffffff",
                                            }}
                                        >
                                            <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.regular }}>
                                                {name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            ) : null}
                        </View>

                        <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 16, gap: 12 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <View style={{ flexDirection: "row", backgroundColor: "#F0F0F3", borderRadius: 16, padding: 2 }}>
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
                                                    backgroundColor: selected ? "#ffffff" : "transparent",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 11,
                                                        color: selected ? "#20242d" : "#9599a5",
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
                                <Text style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}>
                                    Estimated 1RM
                                </Text>
                                <Text style={{ color: "#20242d", fontSize: 30, fontFamily: Fonts.bold }}>
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
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: "#EAF1FE",
                                    borderRadius: 18,
                                    padding: 16,
                                    gap: 8,
                                }}
                            >
                                <View
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons name="trophy" size={16} color="#1263df" />
                                </View>
                                <Text style={{ color: "#20242d", fontSize: 13, fontFamily: Fonts.medium }}>
                                    Personal Record
                                </Text>
                                <Text style={{ color: "#20242d", fontSize: 22, fontFamily: Fonts.bold }}>
                                    {personalRecord ? Math.round(personalRecord.value) : 0} kg
                                </Text>
                                <Text style={{ color: "#4b4f58", fontSize: 11, fontFamily: Fonts.regular }}>
                                    {personalRecord ? `Achieved ${formatDate(personalRecord.date)}` : "No sets yet"}
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: "#E3E6F0",
                                    borderRadius: 18,
                                    padding: 16,
                                    gap: 8,
                                }}
                            >
                                <View
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        backgroundColor: "rgba(255,255,255,0.6)",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons name="barbell" size={16} color="#4b4f58" />
                                </View>
                                <Text style={{ color: "#20242d", fontSize: 13, fontFamily: Fonts.medium }}>
                                    Monthly Volume
                                </Text>
                                <Text style={{ color: "#20242d", fontSize: 22, fontFamily: Fonts.bold }}>
                                    {Math.round(monthlyVolume.volume)} kg
                                </Text>
                                <Text style={{ color: "#4b4f58", fontSize: 11, fontFamily: Fonts.regular }}>
                                    {monthlyVolume.workoutCount} workouts
                                </Text>
                            </View>
                        </View>

                        <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 16, gap: 12 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Text style={{ color: "#20242d", fontSize: 17, fontFamily: Fonts.bold }}>
                                    Workout Frequency
                                </Text>
                                <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular }}>
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
        </SafeAreaView>
    );
}
