import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estimateWorkoutCalories } from "@/algorithms/calorieAlgorithm";
import BottomNav from "@/components/custom/BottomNav";
import ExerciseIcon from "@/components/custom/ExerciseIcon";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getProfile } from "@/db/profile";
import { getWorkoutDetail } from "@/db/workouts";
import { formatDate } from "@/lib/format";
import { useAppTheme } from "@/theme/ThemeProvider";
import { resolveTintBg } from "@/theme/tokens";

const FALLBACK_ICON_SET = "ionicons" as const;
const FALLBACK_ICON = "barbell";
const FALLBACK_ICON_BG = "#EAF1FE";
const FALLBACK_ICON_COLOR = "#1263df";

const formatVolume = (kg: number): string => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`;
    return `${Math.round(kg)}`;
};

export default function WorkoutDetailsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const workout = getWorkoutDetail(Number(id));
    const profile = getProfile();

    if (!workout) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: Fonts.regular }}>
                    Workout not found.
                </Text>
            </SafeAreaView>
        );
    }

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
                    <Ionicons name="arrow-back" size={24} color="#1263df" />
                </Pressable>
                <View style={{ flex: 1, alignItems: "center", marginRight: 32 }}>
                    <Text style={{ color: "#1263df", fontSize: 17, fontFamily: Fonts.bold }}>
                        Workout Details
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 12, fontFamily: Fonts.medium }}>
                        {formatDate(workout.startedAt)}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingBottom: Spacing.xxl * 2,
                    gap: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ gap: 4 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 24, fontFamily: Fonts.bold }}>
                        {workout.title}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                        Strength Training
                    </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            paddingVertical: 16,
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <View
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: colors.tintBlueBg,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="stopwatch-outline" size={18} color="#1263df" />
                        </View>
                        <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: Fonts.bold }}>
                            {workout.durationMinutes}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 10, fontFamily: Fonts.medium }}>
                            MIN
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            paddingVertical: 16,
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <View
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: colors.tintOrangeBg,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="flame" size={18} color="#e2703a" />
                        </View>
                        <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: Fonts.bold }}>
                            {profile
                                ? estimateWorkoutCalories({
                                      durationMinutes: workout.durationMinutes,
                                      totalVolumeKg: workout.totalVolumeKg,
                                      totalReps: workout.totalReps,
                                      bodyWeightKg: profile.weight_kg,
                                  })
                                : 0}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 10, fontFamily: Fonts.medium }}>
                            CAL
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.surface,
                            borderRadius: 16,
                            paddingVertical: 16,
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <View
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: colors.surfaceMuted,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="barbell" size={18} color={colors.textSecondary} />
                        </View>
                        <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: Fonts.bold }}>
                            {formatVolume(workout.totalVolumeKg)}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 10, fontFamily: Fonts.medium }}>
                            KG
                        </Text>
                    </View>
                </View>

                {workout.exercises.map((exercise) => {
                    const template = EXERCISE_LIBRARY.find((item) => item.name === exercise.name);
                    const iconSet = template?.iconSet ?? FALLBACK_ICON_SET;
                    const icon = template?.icon ?? FALLBACK_ICON;
                    const iconBg = resolveTintBg(template?.iconBg ?? FALLBACK_ICON_BG, colors);
                    const iconColor = template?.iconColor ?? FALLBACK_ICON_COLOR;
                    const kgLabel = exercise.equipment === "Dumbbell" ? "KG (EA)" : "KG";

                    return (
                        <View
                            key={exercise.id}
                            style={{
                                backgroundColor: colors.surface,
                                borderRadius: 20,
                                padding: 16,
                                gap: 14,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <View
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 14,
                                        backgroundColor: iconBg,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <ExerciseIcon iconSet={iconSet} icon={icon} size={20} color={iconColor} />
                                </View>
                                <View style={{ gap: 2 }}>
                                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                                        {exercise.name}
                                    </Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                        {exercise.sets.length} sets · {Math.round(exercise.totalVolumeKg)} kg
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ width: 44, color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                                    SET
                                </Text>
                                <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                                    {kgLabel}
                                </Text>
                                <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                                    REPS
                                </Text>
                                <View style={{ width: 28 }} />
                            </View>

                            {exercise.sets.map((set, index) => (
                                <View
                                    key={`${exercise.id}-${set.setIndex}`}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: colors.surfaceMuted,
                                        borderRadius: 14,
                                        paddingVertical: 8,
                                        paddingHorizontal: 4,
                                    }}
                                >
                                    <Text style={{ width: 44, color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.semiBold }}>
                                        {index + 1}
                                    </Text>
                                    <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.semiBold }}>
                                        {set.weightKg}
                                    </Text>
                                    <Text style={{ flex: 1, color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.semiBold }}>
                                        {set.reps}
                                    </Text>
                                    <View style={{ width: 28, alignItems: "center" }}>
                                        <Ionicons name="checkmark-circle" size={20} color="#1263df" />
                                    </View>
                                </View>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>

            <BottomNav />
        </SafeAreaView>
    );
}
