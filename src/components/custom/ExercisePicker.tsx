import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import SectionHeader from "@/components/custom/SectionHeader";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { CustomWorkoutSummary, getCustomWorkouts } from "@/db/customWorkouts";

type ExercisePickerProps = {
    selectedIds: string[];
    onToggle: (id: string) => void;
    excludeIds?: string[];
    onSelectRoutine?: (customWorkoutId: number) => void;
};

const ExercisePicker = ({ selectedIds, onToggle, excludeIds = [], onSelectRoutine }: ExercisePickerProps) => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [customWorkouts, setCustomWorkouts] = useState<CustomWorkoutSummary[]>(() =>
        onSelectRoutine ? getCustomWorkouts() : []
    );

    useFocusEffect(
        useCallback(() => {
            if (onSelectRoutine) setCustomWorkouts(getCustomWorkouts());
        }, [onSelectRoutine])
    );

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
                    backgroundColor: "#EDEEF2",
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                }}
            >
                <Ionicons name="search" size={18} color="#9599a5" />
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search exercises..."
                    placeholderTextColor="#9599a5"
                    style={{
                        flex: 1,
                        color: "#20242d",
                        fontSize: 14,
                        fontFamily: Fonts.regular,
                        padding: 0,
                    }}
                />
            </View>

            <View
                style={{
                    flexDirection: "row",
                    backgroundColor: "#E3EBFD",
                    borderRadius: 20,
                    padding: 18,
                    overflow: "hidden",
                }}
            >
                <View style={{ flex: 1, gap: 8 }}>
                    <Text style={{ color: "#1263df", fontSize: 18, fontFamily: Fonts.bold }}>
                        New Routine?
                    </Text>
                    <Text style={{ color: "#4b4f58", fontSize: 13, fontFamily: Fonts.regular, lineHeight: 18 }}>
                        Mix and match exercises to build your perfect session.
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

            {onSelectRoutine && customWorkouts.length > 0 ? (
                <View>
                    <SectionHeader title="My Routines" rightLabel="" />
                    <View style={{ gap: 10 }}>
                        {customWorkouts.map((routine) => (
                            <Pressable
                                key={routine.id}
                                onPress={() => onSelectRoutine(routine.id)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 12,
                                    backgroundColor: "#ffffff",
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
                                        backgroundColor: "#EAF1FE",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons name={routine.icon as ComponentProps<typeof Ionicons>["name"]} size={20} color="#1263df" />
                                </View>
                                <View style={{ gap: 2, flex: 1 }}>
                                    <Text style={{ color: "#20242d", fontSize: 15, fontFamily: Fonts.bold }}>
                                        {routine.name}
                                    </Text>
                                    <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular }}>
                                        {routine.exerciseCount} exercises
                                        {routine.muscleGroups.length > 0 ? ` · ${routine.muscleGroups.join(", ")}` : ""}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#D8DBE3" />
                            </Pressable>
                        ))}
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
                                    backgroundColor: "#ffffff",
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
                                            backgroundColor: exercise.iconBg,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Ionicons name={exercise.icon} size={20} color={exercise.iconColor} />
                                    </View>

                                    <View style={{ gap: 2 }}>
                                        <Text style={{ color: "#20242d", fontSize: 15, fontFamily: Fonts.bold }}>
                                            {exercise.name}
                                        </Text>
                                        <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular }}>
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
                                        borderColor: "#D8DBE3",
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
                    backgroundColor: "#F0F0F3",
                    borderRadius: 16,
                    padding: 14,
                }}
            >
                <Ionicons name="information-circle" size={20} color="#1263df" />
                <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: "#20242d", fontSize: 13, fontFamily: Fonts.bold }}>
                        Pro Tip
                    </Text>
                    <Text style={{ color: "#60646C", fontSize: 12, fontFamily: Fonts.regular, lineHeight: 17 }}>
                        You can adjust reps and weight for each set once you start tracking.
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default ExercisePicker;
