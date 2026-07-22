import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import ConfirmDialog from "@/components/custom/ConfirmDialog";
import ExerciseIcon from "@/components/custom/ExerciseIcon";
import SectionHeader from "@/components/custom/SectionHeader";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { CustomWorkoutSummary, deleteCustomWorkout, getCustomWorkouts } from "@/db/customWorkouts";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useAppTheme } from "@/theme/ThemeProvider";
import { resolveTintBg } from "@/theme/tokens";

const CUSTOM_WORKOUT_PREFIX = "custom-";

export const customWorkoutTemplateId = (id: number) => `${CUSTOM_WORKOUT_PREFIX}${id}`;

export const parseCustomWorkoutTemplateId = (templateId: string): number | null => {
    if (!templateId.startsWith(CUSTOM_WORKOUT_PREFIX)) return null;
    const id = Number(templateId.slice(CUSTOM_WORKOUT_PREFIX.length));
    return Number.isNaN(id) ? null : id;
};

type ExercisePickerProps = {
    selectedIds: string[];
    onToggle: (id: string) => void;
    excludeIds?: string[];
    showCustomWorkouts?: boolean;
};

const ExercisePicker = ({
    selectedIds,
    onToggle,
    excludeIds = [],
    showCustomWorkouts = false,
}: ExercisePickerProps) => {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [query, setQuery] = useState("");
    const [customWorkouts, setCustomWorkouts] = useState<CustomWorkoutSummary[]>(() =>
        showCustomWorkouts ? getCustomWorkouts() : []
    );

    useFocusRefresh(() => {
        if (showCustomWorkouts) setCustomWorkouts(getCustomWorkouts());
    });

    const visibleCustomWorkouts = useMemo(
        () => customWorkouts.filter((routine) => !excludeIds.includes(customWorkoutTemplateId(routine.id))),
        [customWorkouts, excludeIds]
    );

    const [routineToDelete, setRoutineToDelete] = useState<CustomWorkoutSummary | null>(null);

    const handleDeleteRoutine = (routine: CustomWorkoutSummary) => setRoutineToDelete(routine);

    const confirmDeleteRoutine = () => {
        if (!routineToDelete) return;
        const templateId = customWorkoutTemplateId(routineToDelete.id);
        if (selectedIds.includes(templateId)) onToggle(templateId);
        deleteCustomWorkout(routineToDelete.id);
        setCustomWorkouts(getCustomWorkouts());
        setRoutineToDelete(null);
    };

    const exercises = useMemo(() => {
        const q = query.trim().toLowerCase();
        return EXERCISE_LIBRARY.filter((exercise) => {
            if (excludeIds.includes(exercise.id)) return false;
            if (!q) return true;
            return exercise.name.toLowerCase().includes(q);
        });
    }, [query, excludeIds]);

    return (
        <View style={{ gap: 20 }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: colors.surfaceMuted,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                }}
            >
                <Ionicons name="search" size={18} color={colors.textSecondary} />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search exercises..."
                    placeholderTextColor={colors.textSecondary}
                    style={{
                        flex: 1,
                        color: colors.textPrimary,
                        fontSize: 14,
                        fontFamily: Fonts.regular,
                        padding: 0,
                    }}
                />
            </View>

            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: colors.tintBlueBg,
                    borderRadius: 20,
                    padding: 18,
                    overflow: "hidden",
                }}
            >
                <View style={{ flex: 1, gap: 8 }}>
                    <Text style={{ color: "#1263df", fontSize: 18, fontFamily: Fonts.bold }}>
                        New Workout?
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular, lineHeight: 18 }}>
                        Save your favorite muscle-group combos for quick access.
                    </Text>
                    <Pressable
                        onPress={() => router.push("/create-workout")}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            alignSelf: "flex-start",
                            gap: 6,
                            backgroundColor: "#1263df",
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 9,
                            marginTop: 4,
                        }}
                    >
                        <Ionicons name="add-circle-outline" size={16} color="#ffffff" />
                        <Text style={{ color: "#ffffff", fontSize: 12, fontFamily: Fonts.bold }}>
                            Create Custom
                        </Text>
                    </Pressable>
                </View>

                <Ionicons
                    name="barbell"
                    size={72}
                    color="#B7C7EF"
                    style={{ position: "absolute", right: -6, bottom: -10, transform: [{ rotate: "-20deg" }] }}
                />
            </View>

            {showCustomWorkouts && visibleCustomWorkouts.length > 0 ? (
                <View>
                    <SectionHeader title="My Workouts" rightLabel="" />
                    <View style={{ gap: 10 }}>
                        {visibleCustomWorkouts.map((routine) => {
                            const templateId = customWorkoutTemplateId(routine.id);
                            const isSelected = selectedIds.includes(templateId);

                            return (
                                <Pressable
                                    key={routine.id}
                                    onPress={() => onToggle(templateId)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 12,
                                        backgroundColor: isSelected ? colors.tintBlueBg : colors.surface,
                                        borderRadius: 16,
                                        padding: 12,
                                        shadowColor: "#000000",
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.04,
                                        shadowRadius: 8,
                                        elevation: 1,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            backgroundColor: colors.tintBlueBg,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={routine.icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                                            size={20}
                                            color="#1263df"
                                        />
                                    </View>
                                    <View style={{ gap: 2, flex: 1 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                                            {routine.name}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                            {routine.muscleGroups.length > 0
                                                ? routine.muscleGroups.join(", ")
                                                : "No muscle groups tagged"}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => handleDeleteRoutine(routine)} hitSlop={8}>
                                        <Ionicons name="trash-outline" size={16} color="#e2703a" />
                                    </Pressable>
                                    <View
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            borderWidth: isSelected ? 0 : 1.5,
                                            borderColor: colors.border,
                                            backgroundColor: isSelected ? "#1263df" : "transparent",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {isSelected ? <Ionicons name="checkmark" size={15} color="#ffffff" /> : null}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            ) : null}

            <View>
                <SectionHeader title="Common Exercises" rightLabel="Select 1 or more" />

                <View style={{ gap: 10 }}>
                    {exercises.map((exercise) => {
                        const selected = selectedIds.includes(exercise.id);
                        return (
                            <Pressable
                                key={exercise.id}
                                onPress={() => onToggle(exercise.id)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundColor: colors.surface,
                                    borderRadius: 16,
                                    padding: 12,
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
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            backgroundColor: resolveTintBg(exercise.iconBg, colors),
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <ExerciseIcon
                                        iconSet={exercise.iconSet}
                                        icon={exercise.icon}
                                        size={20}
                                        color={exercise.iconColor}
                                    />
                                    </View>

                                    <View style={{ gap: 2 }}>
                                        <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                                            {exercise.name}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                                            {exercise.muscle}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        borderWidth: selected ? 0 : 1.5,
                                        borderColor: colors.border,
                                        backgroundColor: selected ? "#1263df" : "transparent",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {selected ? <Ionicons name="checkmark" size={15} color="#ffffff" /> : null}
                                </View>
                            </Pressable>
                        );
                    })}
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
                <Ionicons name="information-circle" size={20} color="#1263df" />
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                        Pro Tip
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular, lineHeight: 17 }}>
                        You can adjust reps and weight for each set once you start tracking.
                    </Text>
                </View>
            </View>

            <ConfirmDialog
                visible={routineToDelete !== null}
                title="Delete workout"
                message={routineToDelete ? `Delete "${routineToDelete.name}"? This can't be undone.` : ""}
                confirmLabel="Delete"
                onConfirm={confirmDeleteRoutine}
                onCancel={() => setRoutineToDelete(null)}
            />
        </View>
    );
};

export default ExercisePicker;
