import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estimateWorkoutCalories } from "@/algorithms/calorieAlgorithm";
import BottomNav from "@/components/custom/BottomNav";
import Header from "@/components/custom/Header";
import ScreenContent from "@/components/wrappers/ScreenWrapper";
import { Fonts } from "@/constants/fonts";
import { getProfile } from "@/db/profile";
import { deleteWorkout, getWorkoutHistory, WorkoutSummary } from "@/db/workouts";
import { formatDate, formatMonthYear, formatTime } from "@/lib/format";

type Group = { monthLabel: string; workouts: WorkoutSummary[] };

const groupByMonth = (history: WorkoutSummary[]): Group[] => {
    const map = new Map<string, WorkoutSummary[]>();
    for (const workout of history) {
        const label = formatMonthYear(workout.startedAt);
        if (!map.has(label)) map.set(label, []);
        map.get(label)!.push(workout);
    }
    return Array.from(map.entries()).map(([monthLabel, workouts]) => ({ monthLabel, workouts }));
};

export default function HistoryScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<WorkoutSummary[]>(() => getWorkoutHistory());
    const profile = useMemo(() => getProfile(), []);

    useFocusEffect(
        useCallback(() => {
            setHistory(getWorkoutHistory());
        }, [])
    );

    const groups = useMemo(() => groupByMonth(history), [history]);

    const handleDelete = (workout: WorkoutSummary) => {
        Alert.alert(
            "Delete workout",
            `Are you sure you want to delete "${workout.title}"? This can't be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteWorkout(workout.id);
                        setHistory(getWorkoutHistory());
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
            <ScreenContent>
                <Header />

                <View style={{ marginTop: 16, marginBottom: 20, gap: 4 }}>
                    <Text style={{ color: "#20242d", fontSize: 26, fontFamily: Fonts.bold }}>
                        Workout History
                    </Text>
                    <Text style={{ color: "#9599a5", fontSize: 14, fontFamily: Fonts.regular }}>
                        Review your past strength training performance.
                    </Text>
                </View>

                {groups.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}>
                            No workouts yet — start one from Home.
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
                                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold }}>
                                    {group.monthLabel}
                                </Text>
                                <View style={{ flex: 1, height: 1, backgroundColor: "#E4E6ED" }} />
                            </View>

                            <View style={{ gap: 16 }}>
                                {group.workouts.map((workout) => (
                                    <Pressable
                                        key={workout.id}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/workout-details/[id]",
                                                params: { id: String(workout.id) },
                                            })
                                        }
                                        style={{
                                            backgroundColor: "#ffffff",
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
                                                    backgroundColor: "#F0F0F3",
                                                    borderRadius: 12,
                                                    paddingHorizontal: 10,
                                                    paddingVertical: 4,
                                                }}
                                            >
                                                <Text style={{ color: "#4b4f58", fontSize: 11, fontFamily: Fonts.medium }}>
                                                    Strength
                                                </Text>
                                            </View>
                                            <Pressable onPress={() => handleDelete(workout)} hitSlop={8}>
                                                <Ionicons name="trash-outline" size={18} color="#e2703a" />
                                            </Pressable>
                                        </View>

                                        <Text style={{ color: "#20242d", fontSize: 19, fontFamily: Fonts.bold }}>
                                            {workout.title}
                                        </Text>

                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                            <Ionicons name="calendar-outline" size={14} color="#9599a5" />
                                            <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular }}>
                                                {formatDate(workout.startedAt)}
                                            </Text>
                                            <View
                                                style={{
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: 2,
                                                    backgroundColor: "#D8DBE3",
                                                }}
                                            />
                                            <Ionicons name="time-outline" size={14} color="#9599a5" />
                                            <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular }}>
                                                {formatTime(workout.startedAt)}
                                            </Text>
                                        </View>

                                        <View style={{ flexDirection: "row", gap: 12 }}>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: "#F7F8FB",
                                                    borderRadius: 14,
                                                    padding: 12,
                                                    gap: 4,
                                                }}
                                            >
                                                <Text style={{ color: "#9599a5", fontSize: 11, fontFamily: Fonts.regular }}>
                                                    Total Calories
                                                </Text>
                                                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold }}>
                                                    {profile
                                                        ? estimateWorkoutCalories({
                                                              durationMinutes: workout.durationMinutes,
                                                              totalVolumeKg: workout.totalVolumeKg,
                                                              totalReps: workout.totalReps,
                                                              bodyWeightKg: profile.weight_kg,
                                                          })
                                                        : 0}{" "}
                                                    kcal
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: "#F7F8FB",
                                                    borderRadius: 14,
                                                    padding: 12,
                                                    gap: 4,
                                                }}
                                            >
                                                <Text style={{ color: "#9599a5", fontSize: 11, fontFamily: Fonts.regular }}>
                                                    Total Time
                                                </Text>
                                                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold }}>
                                                    {workout.durationMinutes} min
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </ScreenContent>
            <BottomNav />
        </SafeAreaView>
    );
}
