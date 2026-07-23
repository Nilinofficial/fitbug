import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import logo from "@/assets/images/logo.png";
import ExercisePicker, { parseCustomWorkoutTemplateId } from "@/components/custom/ExercisePicker";
import ExerciseTrackerCard from "@/components/custom/ExerciseTrackerCard";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getCustomWorkoutById } from "@/db/customWorkouts";
import { getProfile } from "@/db/profile";
import { saveWorkout } from "@/db/workouts";
import { MONTHS } from "@/lib/format";
import { useAppTheme } from "@/theme/ThemeProvider";
import { SetEntry, WorkoutExercise } from "@/types/workout";

const createSet = (overrides?: Partial<SetEntry>): SetEntry => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    weight: 0,
    reps: 0,
    ...overrides,
});

const formatElapsed = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
};

const MIN_DURATION_MINUTES = 5;

const formatBackfillDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${MONTHS[month - 1].slice(0, 3)} ${day}, ${year}`;
};

const getDefaultStartTime = (): { hour: number; minute: number } => {
    const reminderTime = getProfile()?.reminder_time;
    if (reminderTime) {
        const [hour, minute] = reminderTime.split(":").map(Number);
        if (!Number.isNaN(hour) && !Number.isNaN(minute)) return { hour, minute };
    }
    return { hour: 18, minute: 0 };
};

export default function WorkoutScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const { date } = useLocalSearchParams<{ date?: string }>();
    const isBackfill = Boolean(date);

    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [pickerOpen, setPickerOpen] = useState(true);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [{ hour: startHour, minute: startMinute }] = useState(getDefaultStartTime);
    const [durationMinutes, setDurationMinutes] = useState(45);

    useEffect(() => {
        if (isBackfill || startedAt === null) return;
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startedAt, isBackfill]);

    const handleToggleSelect = (templateId: string) => {
        setSelectedTemplateIds((prev) =>
            prev.includes(templateId)
                ? prev.filter((id) => id !== templateId)
                : [...prev, templateId]
        );
    };

    const handleOpenPicker = () => {
        setSelectedTemplateIds([]);
        setPickerOpen(true);
    };

    const handleBeginWorkout = () => {
        if (selectedTemplateIds.length === 0) return;

        setStartedAt(Date.now());

        const newExercises: WorkoutExercise[] = selectedTemplateIds
            .map((templateId): WorkoutExercise | null => {
                const customId = parseCustomWorkoutTemplateId(templateId);
                if (customId !== null) {
                    const routine = getCustomWorkoutById(customId);
                    if (!routine) return null;
                    return {
                        instanceId: `${templateId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                        templateId,
                        name: routine.name,
                        equipment: "Custom",
                        muscle: routine.muscleGroups.length > 0 ? routine.muscleGroups.join(", ") : "Custom Workout",
                        sets: [createSet()],
                    };
                }

                const template = EXERCISE_LIBRARY.find((item) => item.id === templateId);
                if (!template) return null;
                return {
                    instanceId: `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    templateId: template.id,
                    name: template.name,
                    equipment: template.equipment,
                    muscle: template.muscle,
                    sets: [createSet()],
                };
            })
            .filter((exercise): exercise is WorkoutExercise => exercise !== null);

        setExercises((prev) => [...prev, ...newExercises]);
        setSelectedTemplateIds([]);
        setPickerOpen(false);
    };

    const handleAddSet = (instanceId: string) => {
        setExercises((prev) =>
            prev.map((exercise) =>
                exercise.instanceId === instanceId
                    ? { ...exercise, sets: [...exercise.sets, createSet()] }
                    : exercise
            )
        );
    };

    const handleRepeatPrevious = (instanceId: string) => {
        setExercises((prev) =>
            prev.map((exercise) => {
                if (exercise.instanceId !== instanceId) return exercise;
                const last = exercise.sets[exercise.sets.length - 1];
                return {
                    ...exercise,
                    sets: [
                        ...exercise.sets,
                        createSet({ weight: last?.weight ?? 0, reps: last?.reps ?? 0 }),
                    ],
                };
            })
        );
    };

    const handleUpdateSet = (
        instanceId: string,
        setId: string,
        field: "weight" | "reps",
        delta: number
    ) => {
        setExercises((prev) =>
            prev.map((exercise) =>
                exercise.instanceId === instanceId
                    ? {
                          ...exercise,
                          sets: exercise.sets.map((set) =>
                              set.id === setId
                                  ? { ...set, [field]: Math.max(0, set[field] + delta) }
                                  : set
                          ),
                      }
                    : exercise
            )
        );
    };

    const handleSetValue = (
        instanceId: string,
        setId: string,
        field: "weight" | "reps",
        value: number
    ) => {
        setExercises((prev) =>
            prev.map((exercise) =>
                exercise.instanceId === instanceId
                    ? {
                          ...exercise,
                          sets: exercise.sets.map((set) =>
                              set.id === setId ? { ...set, [field]: Math.max(0, value) } : set
                          ),
                      }
                    : exercise
            )
        );
    };

    const handleRemoveSet = (instanceId: string, setId: string) => {
        setExercises((prev) =>
            prev.map((exercise) =>
                exercise.instanceId === instanceId
                    ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
                    : exercise
            )
        );
    };

    const handleRemoveExercise = (instanceId: string) => {
        setExercises((prev) => {
            const next = prev.filter((exercise) => exercise.instanceId !== instanceId);
            if (next.length === 0) {
                handleOpenPicker();
            }
            return next;
        });
    };

    const handleClose = () => {
        if (pickerOpen && exercises.length > 0) {
            setPickerOpen(false);
            return;
        }
        router.back();
    };

    const handleFinishWorkout = () => {
        if (isBackfill && date) {
            const [year, month, day] = date.split("-").map(Number);
            const backfillStartedAt = new Date(year, month - 1, day, startHour, startMinute, 0, 0).getTime();
            const backfillFinishedAt = backfillStartedAt + durationMinutes * 60000;
            saveWorkout({ startedAt: backfillStartedAt, finishedAt: backfillFinishedAt, exercises });
        } else {
            saveWorkout({ startedAt: startedAt ?? Date.now(), finishedAt: Date.now(), exercises });
        }
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {pickerOpen ? (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: Spacing.screenHorizontal,
                        paddingVertical: Spacing.screenVertical,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <Pressable onPress={handleClose} hitSlop={8}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </Pressable>
                        <Text style={{ color: "#1263df", fontSize: 20, fontFamily: Fonts.bold }}>
                            Workout Setup
                        </Text>
                    </View>

                    <Image
                        source={logo}
                        contentFit="cover"
                        style={{ width: 36, height: 36, borderRadius: 18 }}
                    />
                </View>
            ) : (
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: Spacing.screenHorizontal,
                        paddingVertical: Spacing.screenVertical,
                    }}
                >
                    <Pressable
                        onPress={handleClose}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: colors.surface,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="close" size={20} color={colors.textPrimary} />
                    </Pressable>

                    <View style={{ alignItems: "center" }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                            New Workout
                        </Text>
                        <Text style={{ color: "#1263df", fontSize: 12, fontFamily: Fonts.medium }}>
                            {isBackfill && date ? formatBackfillDate(date) : formatElapsed(elapsedSeconds)}
                        </Text>
                    </View>

                    <Pressable hitSlop={8}>
                        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
                    </Pressable>
                </View>
            )}

            {pickerOpen ? (
                <>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: Spacing.screenHorizontal,
                            paddingBottom: Spacing.xxl,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <ExercisePicker
                            selectedIds={selectedTemplateIds}
                            onToggle={handleToggleSelect}
                            excludeIds={exercises.map((exercise) => exercise.templateId)}
                            showCustomWorkouts
                        />
                    </ScrollView>

                    <View
                        style={{
                            paddingHorizontal: Spacing.screenHorizontal,
                            paddingBottom: Spacing.lg,
                        }}
                    >
                        <Pressable
                            onPress={handleBeginWorkout}
                            disabled={selectedTemplateIds.length === 0}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                backgroundColor: "#1263df",
                                borderRadius: 30,
                                paddingVertical: 16,
                                opacity: selectedTemplateIds.length === 0 ? 0.5 : 1,
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 16, fontFamily: Fonts.bold }}>
                                Begin Workout
                            </Text>
                            <Ionicons name="play" size={16} color="#ffffff" />
                        </Pressable>
                    </View>
                </>
            ) : (
                <>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: Spacing.screenHorizontal,
                            paddingBottom: Spacing.xxl,
                            gap: Spacing.xxl,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
        {isBackfill ? (
                            <View
                                style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 20,
                                    padding: 16,
                                    gap: 14,
                                }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 15, fontFamily: Fonts.bold }}>
                                    Session
                                </Text>

                                <View style={{ gap: 8 }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.medium }}>
                                        Duration
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 16,
                                        }}
                                    >
                                        <Pressable
                                            onPress={() =>
                                                setDurationMinutes((prev) => Math.max(MIN_DURATION_MINUTES, prev - 5))
                                            }
                                            style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: 15,
                                                backgroundColor: colors.surfaceMuted,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Ionicons name="remove" size={16} color={colors.textPrimary} />
                                        </Pressable>
                                        <Text style={{ color: colors.textPrimary, fontSize: 20, fontFamily: Fonts.bold, minWidth: 70, textAlign: "center" }}>
                                            {durationMinutes} min
                                        </Text>
                                        <Pressable
                                            onPress={() => setDurationMinutes((prev) => prev + 5)}
                                            style={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: 15,
                                                backgroundColor: colors.surfaceMuted,
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Ionicons name="add" size={16} color={colors.textPrimary} />
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        ) : null}

                        {exercises.map((exercise) => (
                            <ExerciseTrackerCard
                                key={exercise.instanceId}
                                exercise={exercise}
                                onAddSet={() => handleAddSet(exercise.instanceId)}
                                onRepeatLastSet={() => handleRepeatPrevious(exercise.instanceId)}
                                onUpdateSet={(setId, field, delta) =>
                                    handleUpdateSet(exercise.instanceId, setId, field, delta)
                                }
                                onSetValue={(setId, field, value) =>
                                    handleSetValue(exercise.instanceId, setId, field, value)
                                }
                                onRemoveSet={(setId) => handleRemoveSet(exercise.instanceId, setId)}
                                onRemove={() => handleRemoveExercise(exercise.instanceId)}
                            />
                        ))}

                        <Pressable
                            onPress={handleOpenPicker}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: colors.border,
                                paddingVertical: 14,
                                backgroundColor: colors.surfaceMuted,
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={18} color={colors.textPrimary} />
                            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                Add Exercise
                            </Text>
                        </Pressable>
                    </ScrollView>

                    <View
                        style={{
                            paddingHorizontal: Spacing.screenHorizontal,
                            paddingBottom: Spacing.lg,
                        }}
                    >
                        <Pressable
                            onPress={handleFinishWorkout}
                            style={{
                                backgroundColor: "#1263df",
                                borderRadius: 30,
                                paddingVertical: 16,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 16, fontFamily: Fonts.bold }}>
                                {isBackfill ? "Save Workout" : "Finish Workout"}
                            </Text>
                        </Pressable>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
