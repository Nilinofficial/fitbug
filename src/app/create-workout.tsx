import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ExercisePicker from "@/components/custom/ExercisePicker";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { DraftCustomWorkoutExercise, saveCustomWorkout } from "@/db/customWorkouts";

type IconName = ComponentProps<typeof Ionicons>["name"];

const MUSCLE_GROUPS: { key: string; icon: IconName }[] = [
    { key: "Chest", icon: "body-outline" },
    { key: "Back", icon: "accessibility-outline" },
    { key: "Legs", icon: "walk-outline" },
    { key: "Arms", icon: "barbell-outline" },
    { key: "Shoulders", icon: "fitness-outline" },
    { key: "Core", icon: "ellipse-outline" },
    { key: "Triceps", icon: "hand-left-outline" },
    { key: "Biceps", icon: "hand-right-outline" },
];

const WORKOUT_ICON_OPTIONS: IconName[] = ["barbell", "walk", "flame", "heart", "body", "flash"];

export default function CreateWorkoutScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [selectedIcon, setSelectedIcon] = useState<IconName>(WORKOUT_ICON_OPTIONS[0]);
    const [draftExercises, setDraftExercises] = useState<DraftCustomWorkoutExercise[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSelectedIds, setModalSelectedIds] = useState<string[]>([]);

    const toggleMuscle = (key: string) => {
        setSelectedMuscles((prev) =>
            prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
        );
    };

    const openModal = () => {
        setModalSelectedIds(draftExercises.map((e) => e.templateId));
        setModalOpen(true);
    };

    const handleModalDone = () => {
        setDraftExercises((prev) => {
            const kept = prev.filter((e) => modalSelectedIds.includes(e.templateId));
            const newOnes: DraftCustomWorkoutExercise[] = modalSelectedIds
                .filter((id) => !prev.some((e) => e.templateId === id))
                .map((id) => {
                    const template = EXERCISE_LIBRARY.find((t) => t.id === id)!;
                    return {
                        templateId: template.id,
                        name: template.name,
                        equipment: template.equipment,
                        muscle: template.muscle,
                        targetSets: 3,
                        targetRepsMin: 8,
                        targetRepsMax: 12,
                    };
                });
            return [...kept, ...newOnes];
        });
        setModalOpen(false);
    };

    const removeExercise = (templateId: string) => {
        setDraftExercises((prev) => prev.filter((e) => e.templateId !== templateId));
    };

    const adjustSets = (templateId: string, delta: number) => {
        setDraftExercises((prev) =>
            prev.map((e) =>
                e.templateId === templateId ? { ...e, targetSets: Math.max(1, e.targetSets + delta) } : e
            )
        );
    };

    const adjustReps = (templateId: string, delta: number) => {
        setDraftExercises((prev) =>
            prev.map((e) => {
                if (e.templateId !== templateId) return e;
                const min = Math.max(1, e.targetRepsMin + delta);
                const max = Math.max(min + 1, e.targetRepsMax + delta);
                return { ...e, targetRepsMin: min, targetRepsMax: max };
            })
        );
    };

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Name required", "Please enter a workout name.");
            return;
        }
        saveCustomWorkout({
            name: name.trim(),
            icon: selectedIcon,
            muscleGroups: selectedMuscles,
            exercises: draftExercises,
        });
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
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
                <Text style={{ color: "#20242d", fontSize: 18, fontFamily: Fonts.bold }}>New Workout</Text>
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
                    <Text style={{ color: "#20242d", fontSize: 17, fontFamily: Fonts.bold }}>
                        Workout Name
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Monday Morning Pump"
                        placeholderTextColor="#9599a5"
                        style={{
                            backgroundColor: "#EDEEF2",
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            paddingVertical: 14,
                            color: "#20242d",
                            fontSize: 15,
                            fontFamily: Fonts.regular,
                        }}
                    />
                </View>

                <View style={{ gap: 8 }}>
                    <Text style={{ color: "#20242d", fontSize: 17, fontFamily: Fonts.bold }}>
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
                                        backgroundColor: selected ? "#EAF1FE" : "#EDEEF2",
                                        borderWidth: selected ? 1 : 0,
                                        borderColor: "#1263df",
                                    }}
                                >
                                    <Ionicons name={group.icon} size={20} color={selected ? "#1263df" : "#60646C"} />
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: selected ? "#1263df" : "#4b4f58",
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
                    <Text style={{ color: "#20242d", fontSize: 17, fontFamily: Fonts.bold }}>
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
                                        backgroundColor: selected ? "#1263df" : "#EDEEF2",
                                    }}
                                >
                                    <Ionicons name={icon} size={20} color={selected ? "#ffffff" : "#60646C"} />
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 16, gap: 14 }}>
                    <Text style={{ color: "#20242d", fontSize: 18, fontFamily: Fonts.bold }}>
                        Exercises
                    </Text>

                    {draftExercises.length === 0 ? (
                        <Text style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}>
                            No exercises added yet.
                        </Text>
                    ) : (
                        <View style={{ gap: 10 }}>
                            {draftExercises.map((exercise) => {
                                const template = EXERCISE_LIBRARY.find((t) => t.id === exercise.templateId);
                                return (
                                    <View
                                        key={exercise.templateId}
                                        style={{
                                            backgroundColor: "#F7F8FB",
                                            borderRadius: 14,
                                            padding: 12,
                                            gap: 10,
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                            }}
                                        >
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                                                <View
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 12,
                                                        backgroundColor: template?.iconBg ?? "#EAF1FE",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={template?.icon ?? "barbell"}
                                                        size={16}
                                                        color={template?.iconColor ?? "#1263df"}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.bold }}>
                                                        {exercise.name}
                                                    </Text>
                                                    <Text style={{ color: "#9599a5", fontSize: 11, fontFamily: Fonts.regular }}>
                                                        {exercise.targetSets} sets • {exercise.targetRepsMin}-{exercise.targetRepsMax} reps
                                                    </Text>
                                                </View>
                                            </View>
                                            <Pressable onPress={() => removeExercise(exercise.templateId)} hitSlop={8}>
                                                <Ionicons name="trash-outline" size={18} color="#e2703a" />
                                            </Pressable>
                                        </View>

                                        <View style={{ flexDirection: "row", gap: 16 }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <Text style={{ color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                                                    Sets
                                                </Text>
                                                <Pressable onPress={() => adjustSets(exercise.templateId, -1)} hitSlop={6}>
                                                    <Ionicons name="remove-circle-outline" size={16} color="#1263df" />
                                                </Pressable>
                                                <Text style={{ color: "#20242d", fontSize: 12, fontFamily: Fonts.semiBold, minWidth: 14, textAlign: "center" }}>
                                                    {exercise.targetSets}
                                                </Text>
                                                <Pressable onPress={() => adjustSets(exercise.templateId, 1)} hitSlop={6}>
                                                    <Ionicons name="add-circle-outline" size={16} color="#1263df" />
                                                </Pressable>
                                            </View>

                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <Text style={{ color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                                                    Reps
                                                </Text>
                                                <Pressable onPress={() => adjustReps(exercise.templateId, -1)} hitSlop={6}>
                                                    <Ionicons name="remove-circle-outline" size={16} color="#1263df" />
                                                </Pressable>
                                                <Text style={{ color: "#20242d", fontSize: 12, fontFamily: Fonts.semiBold, minWidth: 40, textAlign: "center" }}>
                                                    {exercise.targetRepsMin}-{exercise.targetRepsMax}
                                                </Text>
                                                <Pressable onPress={() => adjustReps(exercise.templateId, 1)} hitSlop={6}>
                                                    <Ionicons name="add-circle-outline" size={16} color="#1263df" />
                                                </Pressable>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <Pressable
                        onPress={openModal}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: "#D8DBE3",
                            paddingVertical: 12,
                        }}
                    >
                        <Ionicons name="add-circle-outline" size={18} color="#20242d" />
                        <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.bold }}>
                            Add Exercise
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            <Modal visible={modalOpen} animationType="slide" onRequestClose={() => setModalOpen(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingHorizontal: Spacing.screenHorizontal,
                            paddingVertical: Spacing.screenVertical,
                        }}
                    >
                        <Text style={{ color: "#20242d", fontSize: 18, fontFamily: Fonts.bold }}>
                            Add Exercises
                        </Text>
                        <Pressable onPress={handleModalDone} hitSlop={8}>
                            <Text style={{ color: "#1263df", fontSize: 15, fontFamily: Fonts.bold }}>
                                Done
                            </Text>
                        </Pressable>
                    </View>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: Spacing.screenHorizontal,
                            paddingBottom: Spacing.xxl,
                        }}
                        showsVerticalScrollIndicator={false}
                    >
                        <ExercisePicker
                            selectedIds={modalSelectedIds}
                            onToggle={(id) =>
                                setModalSelectedIds((prev) =>
                                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                                )
                            }
                        />
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}
