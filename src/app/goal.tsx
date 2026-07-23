import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estimateWorkoutCalories } from "@/algorithms/calorieAlgorithm";
import {
    ACTIVITY_LEVEL_LABELS,
    calculateBMR,
    calculateDailyCalorieTarget,
    calculateProteinTargetG,
    calculateTDEE,
    dailyCalorieDelta,
    estimateActivityLevel,
    estimateWeeksToGoal,
} from "@/algorithms/goalAlgorithm";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { Goal, getProfile, setGoal } from "@/db/profile";
import { getWeeklyWorkoutFrequency } from "@/db/progress";
import { getWorkoutHistory } from "@/db/workouts";
import { useAppTheme } from "@/theme/ThemeProvider";

const GOAL_OPTIONS: { label: string; value: Goal; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Lose Fat", value: "fat_loss", icon: "trending-down" },
    { label: "Build Muscle", value: "muscle_gain", icon: "trending-up" },
    { label: "Lose Fat & Build Muscle", value: "recomp", icon: "swap-horizontal" },
    { label: "Maintain", value: "maintain", icon: "remove" },
];

export default function GoalScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [profile, setProfile] = useState(() => getProfile());
    const [editing, setEditing] = useState(() => !profile?.goal || profile.target_weight_kg == null);
    const [targetWeight, setTargetWeight] = useState(
        profile?.target_weight_kg != null ? String(profile.target_weight_kg) : ""
    );
    const [goal, setGoalChoice] = useState<Goal>(profile?.goal ?? "fat_loss");
    const [error, setError] = useState("");

    const weeklyFrequency = useMemo(() => getWeeklyWorkoutFrequency(4), []);
    const avgWorkoutsPerWeek = useMemo(
        () => weeklyFrequency.reduce((sum, bucket) => sum + bucket.count, 0) / weeklyFrequency.length,
        [weeklyFrequency]
    );

    const avgCaloriesPerWorkout = useMemo(() => {
        if (!profile) return 0;
        const history = getWorkoutHistory().slice(0, 10);
        if (history.length === 0) return 0;
        const total = history.reduce(
            (sum, workout) =>
                sum +
                estimateWorkoutCalories({
                    durationMinutes: workout.durationMinutes,
                    totalVolumeKg: workout.totalVolumeKg,
                    totalReps: workout.totalReps,
                    bodyWeightKg: profile.weight_kg,
                }),
            0
        );
        return Math.round(total / history.length);
    }, [profile]);

    if (!profile) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: Fonts.regular }}>
                    Profile not found.
                </Text>
            </SafeAreaView>
        );
    }

    const handleSave = () => {
        const targetValue = Number(targetWeight);
        if (!Number.isFinite(targetValue) || targetValue <= 0) {
            setError("Please enter a valid target weight.");
            return;
        }
        setError("");
        setGoal(targetValue, goal);
        setProfile(getProfile());
        setEditing(false);
    };

    const bmr = calculateBMR({
        weightKg: profile.weight_kg,
        heightCm: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
    });
    const activityLevel = estimateActivityLevel(avgWorkoutsPerWeek);
    const tdee = calculateTDEE(bmr, activityLevel);
    const proteinTarget = calculateProteinTargetG(profile.weight_kg);
    const target = profile.target_weight_kg;
    const currentGoal = profile.goal;
    const dailyTarget = currentGoal ? calculateDailyCalorieTarget(tdee, currentGoal) : null;
    const delta = currentGoal ? dailyCalorieDelta(currentGoal) : 0;
    const weeksToGoal =
        target != null && currentGoal ? estimateWeeksToGoal(profile.weight_kg, target, currentGoal) : null;
    const workoutsPerWeekForGoal =
        delta !== 0 && avgCaloriesPerWorkout > 0 ? Math.abs(delta) / avgCaloriesPerWorkout : null;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingVertical: Spacing.screenVertical,
                }}
            >
                <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 32 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: colors.textPrimary,
                        fontSize: 18,
                        fontFamily: Fonts.bold,
                        marginRight: 32,
                    }}
                >
                    Your Goal
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingBottom: Spacing.xxl,
                    gap: 20,
                }}
                showsVerticalScrollIndicator={false}
            >
                {editing ? (
                    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 18 }}>
                        <View style={{ gap: 8 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                Target Weight (kg)
                            </Text>
                            <TextInput
                                value={targetWeight}
                                onChangeText={setTargetWeight}
                                placeholder={String(profile.weight_kg)}
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                style={{
                                    backgroundColor: colors.surfaceMuted,
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 14,
                                    color: colors.textPrimary,
                                    fontSize: 15,
                                    fontFamily: Fonts.regular,
                                }}
                            />
                        </View>

                        <View style={{ gap: 8 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                Goal
                            </Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                                {GOAL_OPTIONS.map((option) => {
                                    const selected = goal === option.value;
                                    return (
                                        <Pressable
                                            key={option.value}
                                            onPress={() => setGoalChoice(option.value)}
                                            style={{
                                                width: "47%",
                                                alignItems: "center",
                                                gap: 6,
                                                paddingVertical: 14,
                                                paddingHorizontal: 6,
                                                borderRadius: 14,
                                                backgroundColor: selected ? "#1263df" : colors.surfaceMuted,
                                            }}
                                        >
                                            <Ionicons
                                                name={option.icon}
                                                size={18}
                                                color={selected ? "#ffffff" : colors.textSecondary}
                                            />
                                            <Text
                                                style={{
                                                    fontSize: 11,
                                                    textAlign: "center",
                                                    color: selected ? "#ffffff" : colors.textSecondary,
                                                    fontFamily: Fonts.bold,
                                                }}
                                            >
                                                {option.label}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {error ? (
                            <Text style={{ color: "#e2703a", fontSize: 12, fontFamily: Fonts.medium }}>
                                {error}
                            </Text>
                        ) : null}

                        <Pressable
                            onPress={handleSave}
                            style={{
                                backgroundColor: "#1263df",
                                borderRadius: 30,
                                paddingVertical: 16,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 15, fontFamily: Fonts.bold }}>
                                Save Goal
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                backgroundColor: colors.tintBlueBg,
                                borderRadius: 20,
                                padding: 16,
                            }}
                        >
                            <View style={{ gap: 2 }}>
                                <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.medium }}>
                                    Current → Target
                                </Text>
                                <Text style={{ color: colors.textPrimary, fontSize: 20, fontFamily: Fonts.bold }}>
                                    {profile.weight_kg} → {target} kg
                                </Text>
                            </View>
                            <Pressable onPress={() => setEditing(true)} hitSlop={8}>
                                <Text style={{ color: "#1263df", fontSize: 13, fontFamily: Fonts.bold }}>
                                    Edit
                                </Text>
                            </Pressable>
                        </View>

                        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 16 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                                Recommended Daily Calories
                            </Text>
                            <Text style={{ color: "#1263df", fontSize: 36, fontFamily: Fonts.bold }}>
                                {dailyTarget} <Text style={{ fontSize: 16 }}>kcal</Text>
                            </Text>

                            <View style={{ gap: 10 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                        BMR (resting)
                                    </Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                        {bmr} kcal
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                        Activity Level
                                    </Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                        {ACTIVITY_LEVEL_LABELS[activityLevel]}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                        Maintenance (TDEE)
                                    </Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                        {tdee} kcal
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                        Daily {delta >= 0 ? "Surplus" : "Deficit"}
                                    </Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                        {delta === 0 ? "None" : `${delta > 0 ? "+" : ""}${delta} kcal`}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                        Protein Target
                                    </Text>
                                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                        {proteinTarget} g/day
                                    </Text>
                                </View>
                                {weeksToGoal != null ? (
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                                            Estimated Timeline
                                        </Text>
                                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                            ~{weeksToGoal} weeks
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                gap: 10,
                                backgroundColor: colors.surfaceMuted,
                                borderRadius: 16,
                                padding: 14,
                            }}
                        >
                            <Ionicons name="information-circle-outline" size={18} color="#1263df" />
                            <Text
                                style={{
                                    flex: 1,
                                    color: colors.textSecondary,
                                    fontSize: 12,
                                    fontFamily: Fonts.regular,
                                    lineHeight: 17,
                                }}
                            >
                                This is a nutrition target, and diet drives most of it. Exercise is one lever on top:{" "}
                                {workoutsPerWeekForGoal != null
                                    ? `at your average ~${avgCaloriesPerWorkout} kcal/workout, closing this gap through exercise alone would take about ${workoutsPerWeekForGoal.toFixed(1)} sessions/week. Combining training with your calorie target is the sustainable way to get there.`
                                    : "log a few workouts so we can estimate how much exercise can realistically contribute."}
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
