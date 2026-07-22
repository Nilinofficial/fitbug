import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import avatar from "@/assets/images/avatar.png";
import ExercisePicker from "@/components/custom/ExercisePicker";
import ExerciseTrackerCard from "@/components/custom/ExerciseTrackerCard";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getCustomWorkoutExercises } from "@/db/customWorkouts";
import { saveWorkout } from "@/db/workouts";
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

export default function WorkoutScreen() {
    const router = useRouter();
    const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
    const [pickerOpen, setPickerOpen] = useState(true);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
    const [startedAt] = useState(() => Date.now());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startedAt]);

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

    const handleSelectRoutine = (customWorkoutId: number) => {
        const routineTemplateIds = getCustomWorkoutExercises(customWorkoutId)
            .map((exercise) => exercise.templateId)
            .filter((templateId) => !exercises.some((exercise) => exercise.templateId === templateId));

        setSelectedTemplateIds((prev) =>
            Array.from(new Set([...prev, ...routineTemplateIds]))
        );
    };

    const handleBeginWorkout = () => {
        if (selectedTemplateIds.length === 0) return;

        const newExercises: WorkoutExercise[] = selectedTemplateIds
            .map((templateId) => EXERCISE_LIBRARY.find((template) => template.id === templateId))
            .filter((template): template is (typeof EXERCISE_LIBRARY)[number] => Boolean(template))
            .map((template) => ({
                instanceId: `${template.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                templateId: template.id,
                name: template.name,
                equipment: template.equipment,
                muscle: template.muscle,
                sets: [createSet()],
            }));

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
        saveWorkout({ startedAt, finishedAt: Date.now(), exercises });
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
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
                            <Ionicons name="arrow-back" size={24} color="#20242d" />
                        </Pressable>
                        <Text style={{ color: "#1263df", fontSize: 20, fontFamily: Fonts.bold }}>
                            Workout Setup
                        </Text>
                    </View>

                    <Image
                        source={avatar}
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
                            backgroundColor: "#ffffff",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Ionicons name="close" size={20} color="#20242d" />
                    </Pressable>

                    <View style={{ alignItems: "center" }}>
                        <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold }}>
                            New Workout
                        </Text>
                        <Text style={{ color: "#1263df", fontSize: 12, fontFamily: Fonts.medium }}>
                            {formatElapsed(elapsedSeconds)}
                        </Text>
                    </View>

                    <Pressable hitSlop={8}>
                        <Ionicons name="ellipsis-horizontal" size={22} color="#20242d" />
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
                            onSelectRoutine={handleSelectRoutine}
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
                        {exercises.map((exercise) => (
                            <ExerciseTrackerCard
                                key={exercise.instanceId}
                                exercise={exercise}
                                onAddSet={() => handleAddSet(exercise.instanceId)}
                                onRepeatLastSet={() => handleRepeatPrevious(exercise.instanceId)}
                                onUpdateSet={(setId, field, delta) =>
                                    handleUpdateSet(exercise.instanceId, setId, field, delta)
                                }
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
                                borderColor: "#D8DBE3",
                                paddingVertical: 14,
                                backgroundColor: "#F0F0F3",
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#20242d" />
                            <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.bold }}>
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
                                Finish Workout
                            </Text>
                        </Pressable>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
