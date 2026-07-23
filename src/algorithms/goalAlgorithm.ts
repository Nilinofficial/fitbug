/**
 * Turns profile info + logged workout frequency into a recommended daily
 * calorie intake for a goal (fat loss / muscle gain / maintain), using the
 * Mifflin-St Jeor equation for BMR. This is a nutrition estimate, not a
 * workout prescription — exercise is one lever on top of it, not the whole
 * answer.
 */

import { Gender, Goal } from "@/db/profile";

const KCAL_PER_KG_FAT = 7700;

export type BMRInput = {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: Gender;
};

export const calculateBMR = ({ weightKg, heightCm, age, gender }: BMRInput): number => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return Math.round(gender === "male" ? base + 5 : base - 161);
};

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

const ACTIVITY_BANDS: { level: ActivityLevel; maxPerWeek: number; multiplier: number }[] = [
    { level: "sedentary", maxPerWeek: 0, multiplier: 1.2 },
    { level: "light", maxPerWeek: 2, multiplier: 1.375 },
    { level: "moderate", maxPerWeek: 4, multiplier: 1.55 },
    { level: "active", maxPerWeek: 6, multiplier: 1.725 },
    { level: "very_active", maxPerWeek: Infinity, multiplier: 1.9 },
];

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
    sedentary: "Sedentary",
    light: "Lightly Active",
    moderate: "Moderately Active",
    active: "Active",
    very_active: "Very Active",
};

export const estimateActivityLevel = (avgWorkoutsPerWeek: number): ActivityLevel => {
    const band = ACTIVITY_BANDS.find((b) => avgWorkoutsPerWeek <= b.maxPerWeek);
    return band?.level ?? "sedentary";
};

export const activityMultiplier = (level: ActivityLevel): number =>
    ACTIVITY_BANDS.find((b) => b.level === level)?.multiplier ?? 1.2;

export const calculateTDEE = (bmr: number, level: ActivityLevel): number =>
    Math.round(bmr * activityMultiplier(level));

// Standard, safe defaults — not user-tunable. A larger deficit/surplus isn't
// exposed here on purpose; 500 kcal/day ≈ 0.45kg/week, a widely-cited safe pace.
// "recomp" (lose fat & build muscle at once) uses a smaller deficit than a
// pure cut — a big deficit works against the muscle-building half of the goal.
const GOAL_DAILY_DELTA: Record<Goal, number> = {
    fat_loss: -500,
    muscle_gain: 350,
    recomp: -250,
    maintain: 0,
};

const MIN_SAFE_CALORIES = 1200;

export const dailyCalorieDelta = (goal: Goal): number => GOAL_DAILY_DELTA[goal];

export const calculateDailyCalorieTarget = (tdee: number, goal: Goal): number =>
    Math.max(MIN_SAFE_CALORIES, Math.round(tdee + GOAL_DAILY_DELTA[goal]));

/**
 * Weeks to close the gap between current and target weight at the pace implied
 * by the goal's daily calorie delta. Returns null when there's no meaningful
 * gap or the goal is "maintain" (no deficit/surplus driving change).
 */
export const estimateWeeksToGoal = (
    currentWeightKg: number,
    targetWeightKg: number,
    goal: Goal
): number | null => {
    const delta = GOAL_DAILY_DELTA[goal];
    const weightGapKg = Math.abs(targetWeightKg - currentWeightKg);
    if (weightGapKg < 0.1 || delta === 0) return null;

    const totalCalories = weightGapKg * KCAL_PER_KG_FAT;
    const weeklyCalories = Math.abs(delta) * 7;
    return Math.ceil(totalCalories / weeklyCalories);
};

// 1.8g/kg bodyweight — the middle of the commonly-cited 1.6–2.2g/kg range for
// preserving/building muscle in a deficit or surplus. This matters more than
// the exact calorie number, especially for a recomp goal.
const PROTEIN_G_PER_KG = 1.8;

export const calculateProteinTargetG = (weightKg: number): number => Math.round(weightKg * PROTEIN_G_PER_KG);
