import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ExerciseIcon from "@/components/custom/ExerciseIcon";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { ExerciseImprovement, getExerciseImprovements } from "@/db/workouts";
import { formatDate } from "@/lib/format";
import { resolveTintBg } from "@/theme/tokens";
import { useAppTheme } from "@/theme/ThemeProvider";

const FALLBACK_ICON_SET = "ionicons" as const;
const FALLBACK_ICON = "barbell";
const FALLBACK_ICON_BG = "#EAF1FE";
const FALLBACK_ICON_COLOR = "#1263df";

export default function PersonalRecordsScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [improvements] = useState<ExerciseImprovement[]>(() => getExerciseImprovements(100));

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
                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: "#1263df",
                        fontSize: 18,
                        fontFamily: Fonts.bold,
                        marginRight: 32,
                    }}
                >
                    Recent Improvements
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingBottom: Spacing.xxl,
                    gap: 12,
                }}
                showsVerticalScrollIndicator={false}
            >
                {improvements.length === 0 ? (
                    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}>
                            Beat your previous weight or reps on an exercise to see it here.
                        </Text>
                    </View>
                ) : (
                    improvements.map((improvement) => {
                        const template = EXERCISE_LIBRARY.find((item) => item.name === improvement.name);
                        const iconSet = template?.iconSet ?? FALLBACK_ICON_SET;
                        const icon = template?.icon ?? FALLBACK_ICON;
                        const iconBg = resolveTintBg(template?.iconBg ?? FALLBACK_ICON_BG, colors);
                        const iconColor = template?.iconColor ?? FALLBACK_ICON_COLOR;
                        const calorieGain = improvement.estimatedCalories - improvement.previousCalories;

                        return (
                            <View
                                key={improvement.workoutExerciseId}
                                style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 16,
                                    padding: 14,
                                    gap: 10,
                                    shadowColor: "#000000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.04,
                                    shadowRadius: 8,
                                    elevation: 1,
                                }}
                            >
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 14,
                                            backgroundColor: iconBg,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ExerciseIcon iconSet={iconSet} icon={icon} size={18} color={iconColor} />
                                    </View>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                                            {improvement.name}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                            {formatDate(improvement.finishedAt)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", gap: 12 }}>
                                    <View
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.surfaceMuted,
                                            borderRadius: 12,
                                            padding: 10,
                                            gap: 2,
                                        }}
                                    >
                                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.regular }}>
                                            Top Set
                                        </Text>
                                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                            {improvement.topSetWeightKg} kg × {improvement.topSetReps}
                                        </Text>
                                    </View>
                                    <View
                                        style={{
                                            flex: 1,
                                            backgroundColor: colors.surfaceMuted,
                                            borderRadius: 12,
                                            padding: 10,
                                            gap: 2,
                                        }}
                                    >
                                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.regular }}>
                                            Calories Burned
                                        </Text>
                                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                            {improvement.estimatedCalories} cal
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Ionicons name="trending-up" size={13} color="#1263df" />
                                    <Text style={{ color: "#1263df", fontSize: 12, fontFamily: Fonts.medium }}>
                                        +{calorieGain} cal vs previous session ({improvement.previousCalories} cal)
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
