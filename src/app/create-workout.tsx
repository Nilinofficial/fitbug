import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Toast from "@/components/custom/Toast";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { saveCustomWorkout } from "@/db/customWorkouts";
import { useAppTheme } from "@/theme/ThemeProvider";

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const MUSCLE_GROUPS: { key: string; icon: MCIconName }[] = [
    { key: "Chest", icon: "arm-flex-outline" },
    { key: "Back", icon: "human-handsup" },
    { key: "Legs", icon: "run" },
    { key: "Arms", icon: "dumbbell" },
    { key: "Shoulders", icon: "weight-lifter" },
    { key: "Core", icon: "yoga" },
    { key: "Triceps", icon: "weight" },
    { key: "Biceps", icon: "arm-flex" },
];

const WORKOUT_ICON_OPTIONS: MCIconName[] = ["dumbbell", "weight-lifter", "run", "yoga", "arm-flex", "karate"];

export default function CreateWorkoutScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();

    const [name, setName] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<MCIconName>(WORKOUT_ICON_OPTIONS[0]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [hasBarWeight, setHasBarWeight] = useState(false);
    const [barWeight, setBarWeight] = useState("20");

    const toggleMuscle = (key: string) => {
        setSelectedMuscles((prev) =>
            prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
        );
    };

    const handleSave = () => {
        if (!name.trim()) {
            setToastMessage("Please enter a workout name.");
            return;
        }

        const barWeightValue = Number(barWeight);
        if (hasBarWeight && (!Number.isFinite(barWeightValue) || barWeightValue <= 0)) {
            setToastMessage("Please enter a valid bar weight.");
            return;
        }

        saveCustomWorkout({
            name: name.trim(),
            icon: selectedIcon,
            muscleGroups: selectedMuscles,
            hasBarWeight,
            barWeightKg: hasBarWeight ? barWeightValue : 0,
        });
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingVertical: Spacing.screenVertical,
                }}
            >
                <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 40 }}>
                    <Ionicons name="arrow-back" size={22} color="#1263df" />
                </Pressable>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontFamily: Fonts.bold }}>
                    New Workout
                </Text>
                <Pressable onPress={handleSave} hitSlop={8} style={{ width: 40, alignItems: "flex-end" }}>
                    <Text
                        style={{
                            color: name.trim() ? "#1263df" : "#B7C7EF",
                            fontSize: 15,
                            fontFamily: Fonts.bold,
                        }}
                    >
                        Save
                    </Text>
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingBottom: Spacing.xxl * 2,
                    gap: 20,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ gap: 8 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                        Workout Name
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Monday Morning Pump"
                        placeholderTextColor={colors.textSecondary}
                        style={{
                            backgroundColor: colors.surfaceMuted,
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            color: colors.textPrimary,
                            fontSize: 15,
                            fontFamily: Fonts.regular,
                        }}
                    />
                </View>

                <View style={{ gap: 8 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                        Target Muscle Groups
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {MUSCLE_GROUPS.map((group) => {
                            const selected = selectedMuscles.includes(group.key);
                            return (
                                <Pressable
                                    key={group.key}
                                    onPress={() => toggleMuscle(group.key)}
                                    style={{
                                        width: "31%",
                                        alignItems: "center",
                                        gap: 6,
                                        paddingVertical: 14,
                                        borderRadius: 14,
                                        backgroundColor: selected ? colors.tintBlueBg : colors.surfaceMuted,
                                        borderWidth: selected ? 1 : 0,
                                        borderColor: "#1263df",
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={group.icon}
                                        size={20}
                                        color={selected ? "#1263df" : colors.textSecondary}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: selected ? "#1263df" : colors.textSecondary,
                                            fontFamily: selected ? Fonts.bold : Fonts.medium,
                                        }}
                                    >
                                        {group.key}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={{ gap: 8 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                        Workout Icon
                    </Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        {WORKOUT_ICON_OPTIONS.map((icon) => {
                            const selected = icon === selectedIcon;
                            return (
                                <Pressable
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 22,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: selected ? "#1263df" : colors.surfaceMuted,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={icon}
                                        size={20}
                                        color={selected ? "#ffffff" : colors.textSecondary}
                                    />
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: colors.surfaceMuted,
                        borderRadius: 14,
                        padding: 14,
                        gap: hasBarWeight ? 14 : 0,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flex: 1, gap: 2 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                                Has a bar?
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                Barbell/Smith-machine lifts add the bar's own weight to what you log.
                            </Text>
                        </View>
                        <Switch
                            value={hasBarWeight}
                            onValueChange={setHasBarWeight}
                            trackColor={{ true: "#1263df", false: colors.border }}
                            thumbColor="#ffffff"
                        />
                    </View>

                    {hasBarWeight ? (
                        <View style={{ gap: 8 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.medium }}>
                                Default Bar Weight (kg)
                            </Text>
                            <TextInput
                                value={barWeight}
                                onChangeText={setBarWeight}
                                placeholder="20"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 12,
                                    color: colors.textPrimary,
                                    fontSize: 15,
                                    fontFamily: Fonts.regular,
                                }}
                            />
                        </View>
                    ) : null}
                </View>
            </ScrollView>

            <Toast
                visible={toastMessage !== null}
                message={toastMessage ?? ""}
                variant="error"
                onHide={() => setToastMessage(null)}
            />
        </SafeAreaView>
    );
}
