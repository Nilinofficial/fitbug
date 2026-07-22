import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { estimateWorkoutCalories } from "@/algorithms/calorieAlgorithm";
import { Fonts } from "@/constants/fonts";
import { getProfile } from "@/db/profile";
import { getWorkoutsSince } from "@/db/workouts";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useAppTheme } from "@/theme/ThemeProvider";

export type CaloriePeriod = "today" | "week";

const startOfLocalDay = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

const startOfLocalWeek = (date: Date) => {
    const start = startOfLocalDay(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
};

const computeCaloriesBurned = (period: CaloriePeriod): number => {
    const profile = getProfile();
    if (!profile) return 0;

    const since = period === "today" ? startOfLocalDay(new Date()) : startOfLocalWeek(new Date());
    const workouts = getWorkoutsSince(since.toISOString());

    const total = workouts.reduce(
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

    return Math.round(total);
};

type CalorieBurnedCardProps = {
    period: CaloriePeriod;
    backgroundColor?: string;
};

const CalorieBurnedCard = ({ period, backgroundColor }: CalorieBurnedCardProps) => {
    const { colors } = useAppTheme();
    const [calories, setCalories] = useState(() => computeCaloriesBurned(period));

    useFocusRefresh(() => setCalories(computeCaloriesBurned(period)));

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: backgroundColor ?? colors.tintOrangeBg,
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
                    backgroundColor: "rgba(255,255,255,0.3)",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Ionicons name="flame" size={16} color="#e2703a" />
            </View>
            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.medium }}>
                {period === "today" ? "Calories Today" : "Calories This Week"}
            </Text>
            <Text style={{ color: colors.textPrimary, fontSize: 22, fontFamily: Fonts.bold }}>
                {calories} cal
            </Text>
        </View>
    );
};

export default CalorieBurnedCard;
