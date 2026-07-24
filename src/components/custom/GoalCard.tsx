import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { calculateBMR, calculateDailyCalorieTarget, calculateTDEE, estimateActivityLevel } from "@/algorithms/goalAlgorithm";
import { getProfile } from "@/db/profile";
import { getWeeklyWorkoutFrequency } from "@/db/progress";
import { Fonts } from "@/constants/fonts";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useAppTheme } from "@/theme/ThemeProvider";

const GOAL_LABELS = {
    fat_loss: "Lose Fat",
    muscle_gain: "Build Muscle",
    recomp: "Lose Fat & Build Muscle",
    maintain: "Maintain",
} as const;

const GoalCard = () => {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [profile, setProfile] = useState(() => getProfile());

    useFocusRefresh(() => setProfile(getProfile()));

    if (!profile) return null;

    if (!profile.goal || profile.target_weight_kg == null) {
        return (
            <Pressable
                onPress={() => router.push("/goal")}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    backgroundColor: colors.tintBlueBg,
                    borderRadius: 20,
                    padding: 16,
                }}
            >
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: "#1263df",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="flag-outline" size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                        Set a Goal
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                        Get a personalized daily calorie target.
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#1263df" />
            </Pressable>
        );
    }

    const weeklyFrequency = getWeeklyWorkoutFrequency(4);
    const avgWorkoutsPerWeek =
        weeklyFrequency.reduce((sum, bucket) => sum + bucket.count, 0) / weeklyFrequency.length;

    const bmr = calculateBMR({
        weightKg: profile.weight_kg,
        heightCm: profile.height_cm,
        age: profile.age,
        gender: profile.gender,
    });
    const activityLevel = estimateActivityLevel(avgWorkoutsPerWeek);
    const tdee = calculateTDEE(bmr, activityLevel);
    const dailyTarget = calculateDailyCalorieTarget(tdee, profile.goal);

    const weightGap = profile.target_weight_kg - profile.weight_kg;
  
    
    const isAtTarget = Math.abs(weightGap) < 0.1;

    return (
        <Pressable
            onPress={() => router.push("/goal")}
            style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                padding: 16,
                gap: 14,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 12,
                            backgroundColor: colors.tintBlueBg,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="flag" size={16} color="#1263df" />
                    </View>
                    <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                        {GOAL_LABELS[profile.goal]}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                        Current → Target
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                        {profile.weight_kg} → {profile.target_weight_kg} kg
                    </Text>
                    {!isAtTarget ? (
                        <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.regular }}>
                            {weightGap > 0 ? "+" : ""}
                            {weightGap.toFixed(1)} kg to go
                        </Text>
                    ) : null}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                        Daily Target
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                        {dailyTarget} kcal
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

export default GoalCard;
