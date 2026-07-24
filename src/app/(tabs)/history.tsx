import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ConfirmDialog from "@/components/custom/ConfirmDialog";
import Header from "@/components/custom/Header";
import ScreenContent from "@/components/wrappers/ScreenWrapper";
import { Fonts } from "@/constants/fonts";
import { deleteWorkout, getWorkoutHistory, WorkoutSummary } from "@/db/workouts";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { formatDayHeader, formatMonthYear, formatTime } from "@/lib/format";
import { useAppTheme } from "@/theme/ThemeProvider";

type DayGroup = { dayLabel: string; workouts: WorkoutSummary[] };
type MonthGroup = { monthLabel: string; days: DayGroup[] };

const groupByMonth = (history: WorkoutSummary[]): MonthGroup[] => {
    const monthMap = new Map<string, Map<string, WorkoutSummary[]>>();
    for (const workout of history) {
        const monthLabel = formatMonthYear(workout.startedAt);
        const dayLabel = formatDayHeader(workout.startedAt);
        if (!monthMap.has(monthLabel)) monthMap.set(monthLabel, new Map());
        const dayMap = monthMap.get(monthLabel)!;
        if (!dayMap.has(dayLabel)) dayMap.set(dayLabel, []);
        dayMap.get(dayLabel)!.push(workout);
    }
    return Array.from(monthMap.entries()).map(([monthLabel, dayMap]) => ({
        monthLabel,
        days: Array.from(dayMap.entries()).map(([dayLabel, workouts]) => ({ dayLabel, workouts })),
    }));
};

export default function HistoryScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [history, setHistory] = useState<WorkoutSummary[]>(() => getWorkoutHistory());

    useFocusRefresh(() => setHistory(getWorkoutHistory()));

    const groups = useMemo(() => groupByMonth(history), [history]);

    const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutSummary | null>(null);

    const handleDelete = (workout: WorkoutSummary) => setWorkoutToDelete(workout);

    const confirmDelete = () => {
        if (!workoutToDelete) return;
        deleteWorkout(workoutToDelete.id);
        setHistory(getWorkoutHistory());
        setWorkoutToDelete(null);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenContent>
                <Header />

                <View style={{ marginTop: 16, marginBottom: 20, gap: 4 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 26, fontFamily: Fonts.bold }}>
                        Workout History
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: Fonts.regular }}>
                        Review your past strength training performance.
                    </Text>
                </View>

                {groups.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                            No workouts yet. Start one from Home.
                        </Text>
                    </View>
                ) : (
                    groups.map((group) => (
                        <View key={group.monthLabel} style={{ marginBottom: 20 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                    marginBottom: 12,
                                }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                                    {group.monthLabel}
                                </Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                            </View>

                            <View style={{ gap: 20 }}>
                                {group.days.map((day) => (
                                    <View key={day.dayLabel} style={{ gap: 12 }}>
                                        <Text
                                            style={{
                                                color: colors.textSecondary,
                                                fontSize: 12,
                                                fontFamily: Fonts.bold,
                                                textTransform: "uppercase",
                                                letterSpacing: 0.4,
                                            }}
                                        >
                                            {day.dayLabel}
                                        </Text>

                                        <View style={{ gap: 16 }}>
                                            {day.workouts.map((workout) => (
                                                <Pressable
                                                    key={workout.id}
                                                    onPress={() =>
                                                        router.push({
                                                            pathname: "/workout-details/[id]",
                                                            params: { id: String(workout.id) },
                                                        })
                                                    }
                                                    style={{
                                                        backgroundColor: colors.surface,
                                                        borderRadius: 20,
                                                        padding: 16,
                                                        gap: 12,
                                                        shadowColor: "#000000",
                                                        shadowOffset: { width: 0, height: 2 },
                                                        shadowOpacity: 0.04,
                                                        shadowRadius: 8,
                                                        elevation: 1,
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                            justifyContent: "space-between",
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                backgroundColor: colors.surfaceMuted,
                                                                borderRadius: 12,
                                                                paddingHorizontal: 10,
                                                                paddingVertical: 4,
                                                            }}
                                                        >
                                                            <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                                                                Strength
                                                            </Text>
                                                        </View>
                                                        <Pressable onPress={() => handleDelete(workout)} hitSlop={8}>
                                                            <Ionicons name="trash-outline" size={18} color="#e2703a" />
                                                        </Pressable>
                                                    </View>

                                                    <Text style={{ color: colors.textPrimary, fontSize: 19, fontFamily: Fonts.bold }}>
                                                        {workout.title}
                                                    </Text>

                                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                                            {formatTime(workout.startedAt)}
                                                        </Text>
                                                    </View>

                                                    <View style={{ flexDirection: "row", gap: 12 }}>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                backgroundColor: colors.surfaceMuted,
                                                                borderRadius: 14,
                                                                padding: 12,
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.regular }}>
                                                                Total Calories
                                                            </Text>
                                                            <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                                                                {workout.estimatedCalories} cal
                                                            </Text>
                                                        </View>
                                                        <View
                                                            style={{
                                                                flex: 1,
                                                                backgroundColor: colors.surfaceMuted,
                                                                borderRadius: 14,
                                                                padding: 12,
                                                                gap: 4,
                                                            }}
                                                        >
                                                            <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.regular }}>
                                                                Total Time
                                                            </Text>
                                                            <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                                                                {workout.durationMinutes} min
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </ScreenContent>

            <ConfirmDialog
                visible={workoutToDelete !== null}
                title="Delete workout"
                message={
                    workoutToDelete
                        ? `Are you sure you want to delete "${workoutToDelete.title}"? This can't be undone.`
                        : ""
                }
                confirmLabel="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setWorkoutToDelete(null)}
            />
        </SafeAreaView>
    );
}
