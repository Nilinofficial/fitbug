import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { estimateWorkoutCalories } from "@/algorithms/calorieAlgorithm";
import BottomNav from "@/components/custom/BottomNav";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getProfile } from "@/db/profile";
import { getWorkoutDetail } from "@/db/workouts";
import { formatDate } from "@/lib/format";

const FALLBACK_ICON = "barbell" as const;
const FALLBACK_ICON_BG = "#EAF1FE";
const FALLBACK_ICON_COLOR = "#1263df";

const formatVolume = (kg: number): string => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`;
    return `${Math.round(kg)}`;
};

export default function WorkoutDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const workout = getWorkoutDetail(Number(id));
    const profile = getProfile();

    if (!workout) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#9599a5", fontSize: 14, fontFamily: Fonts.regular }}>
                    Workout not found.
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
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
                    <Text style={{ color: "#20242d", fontSize: 12, fontFamily: Fonts.medium }}>
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
                    <Text style={{ color: "#20242d", fontSize: 24, fontFamily: Fonts.bold }}>
                        {workout.title}
                    </Text>
                    <Text style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}>
                        Strength Training
                    </Text>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "#ffffff",
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
                                backgroundColor: "#EAF1FE",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="stopwatch-outline" size={18} color="#1263df" />
                        </View>
                        <Text style={{ color: "#20242d", fontSize: 22, fontFamily: Fonts.bold }}>
                            {workout.durationMinutes}
                        </Text>
                        <Text style={{ color: "#9599a5", fontSize: 10, fontFamily: Fonts.medium }}>
                            MIN
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "#ffffff",
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
                                backgroundColor: "#FFF1E6",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="flame" size={18} color="#e2703a" />
                        </View>
                        <Text style={{ color: "#20242d", fontSize: 22, fontFamily: Fonts.bold }}>
                            {profile
                                ? estimateWorkoutCalories({
                                      durationMinutes: workout.durationMinutes,
                                      totalVolumeKg: workout.totalVolumeKg,
                                      totalReps: workout.totalReps,
                                      bodyWeightKg: profile.weight_kg,
                                  })
                                : 0}
                        </Text>
                        <Text style={{ color: "#9599a5", fontSize: 10, fontFamily: Fonts.medium }}>
                            KCAL
                        </Text>
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "#ffffff",
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
                                backgroundColor: "#F0F0F3",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="barbell" size={18} color="#4b4f58" />
                        </View>
                        <Text style={{ color: "#20242d", fontSize: 22, fontFamily: Fonts.bold }}>
                            {formatVolume(workout.totalVolumeKg)}
                        </Text>
                        <Text style={{ color: "#9599a5", fontSize: 10, fontFamily: Fonts.medium }}>
                            KG
                        </Text>
                    </View>
                </View>

                {workout.exercises.map((exercise) => {
                    const template = EXERCISE_LIBRARY.find((item) => item.name === exercise.name);
                    const icon = template?.icon ?? FALLBACK_ICON;
                    const iconBg = template?.iconBg ?? FALLBACK_ICON_BG;
                    const iconColor = template?.iconColor ?? FALLBACK_ICON_COLOR;
                    const kgLabel = exercise.equipment === "Dumbbell" ? "KG (EA)" : "KG";

                    return (
                        <View
                            key={exercise.id}
                            style={{
                                backgroundColor: "#ffffff",
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
                                    <Ionicons name={icon} size={20} color={iconColor} />
                                </View>
                                <View style={{ gap: 2 }}>
                                    <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold }}>
                                        {exercise.name}
                                    </Text>
                                    <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular }}>
                                        {exercise.sets.length} sets · {Math.round(exercise.totalVolumeKg)} kg
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: "row", paddingHorizontal: 4 }}>
                                <Text style={{ width: 44, color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                                    SET
                                </Text>
                                <Text style={{ flex: 1, color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                                    {kgLabel}
                                </Text>
                                <Text style={{ flex: 1, color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
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
                                        backgroundColor: "#F7F8FB",
                                        borderRadius: 14,
                                        paddingVertical: 8,
                                        paddingHorizontal: 4,
                                    }}
                                >
                                    <Text style={{ width: 44, color: "#20242d", fontSize: 14, fontFamily: Fonts.semiBold }}>
                                        {index + 1}
                                    </Text>
                                    <Text style={{ flex: 1, color: "#20242d", fontSize: 14, fontFamily: Fonts.semiBold }}>
                                        {set.weightKg}
                                    </Text>
                                    <Text style={{ flex: 1, color: "#20242d", fontSize: 14, fontFamily: Fonts.semiBold }}>
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
