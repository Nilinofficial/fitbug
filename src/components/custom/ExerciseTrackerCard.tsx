import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { WorkoutExercise } from "@/types/workout";

type ExerciseTrackerCardProps = {
    exercise: WorkoutExercise;
    onAddSet: () => void;
    onRepeatLastSet: () => void;
    onUpdateSet: (setId: string, field: "weight" | "reps", delta: number) => void;
    onRemove: () => void;
};

const ExerciseTrackerCard = ({
    exercise,
    onAddSet,
    onRepeatLastSet,
    onUpdateSet,
    onRemove,
}: ExerciseTrackerCardProps) => {
    const handleRemove = () => {
        Alert.alert("Remove exercise", `Remove ${exercise.name} from this workout?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: onRemove },
        ]);
    };

    return (
        <View
            style={{
                backgroundColor: "#ffffff",
                borderRadius: 20,
                padding: 18,
                gap: 14,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 1,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ gap: 2 }}>
                    <Text
                        selectable
                        style={{ color: "#20242d", fontSize: 20, fontFamily: Fonts.bold }}
                    >
                        {exercise.name}
                    </Text>
                    <Text
                        selectable
                        style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}
                    >
                        {exercise.equipment} · {exercise.muscle}
                    </Text>
                </View>

                <Pressable onPress={handleRemove} hitSlop={8}>
                    <Ionicons name="ellipsis-vertical" size={20} color="#9599a5" />
                </Pressable>
            </View>

            <View style={{ flexDirection: "row", paddingHorizontal: 4 }}>
                <Text style={{ width: 44, color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                    SET
                </Text>
                <Text style={{ flex: 1, color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                    KG
                </Text>
                <Text style={{ flex: 1, color: "#9599a5", fontSize: 11, fontFamily: Fonts.medium }}>
                    REPS
                </Text>
            </View>

            {exercise.sets.map((set, index) => {
                const isLast = index === exercise.sets.length - 1;

                return (
                    <View
                        key={set.id}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: isLast ? "#EAF1FB" : "#F7F8FB",
                            borderRadius: 14,
                            paddingVertical: 8,
                            paddingHorizontal: 4,
                        }}
                    >
                        <View
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                marginLeft: 8,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isLast ? "#1263df" : "#E0E1E6",
                            }}
                        >
                            <Text
                                style={{
                                    color: isLast ? "#ffffff" : "#60646C",
                                    fontSize: 13,
                                    fontFamily: Fonts.bold,
                                }}
                            >
                                {index + 1}
                            </Text>
                        </View>

                        {isLast ? (
                            <>
                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                                    <Pressable onPress={() => onUpdateSet(set.id, "weight", -2.5)} hitSlop={6}>
                                        <Ionicons name="remove-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                    <Text style={{ color: "#20242d", fontSize: 15, fontFamily: Fonts.semiBold, minWidth: 34 }}>
                                        {set.weight}
                                    </Text>
                                    <Pressable onPress={() => onUpdateSet(set.id, "weight", 2.5)} hitSlop={6}>
                                        <Ionicons name="add-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                </View>
                                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
                                    <Pressable onPress={() => onUpdateSet(set.id, "reps", -1)} hitSlop={6}>
                                        <Ionicons name="remove-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                    <Text style={{ color: "#20242d", fontSize: 15, fontFamily: Fonts.semiBold, minWidth: 20 }}>
                                        {set.reps}
                                    </Text>
                                    <Pressable onPress={() => onUpdateSet(set.id, "reps", 1)} hitSlop={6}>
                                        <Ionicons name="add-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text
                                    style={{
                                        flex: 1,
                                        marginLeft: 12,
                                        color: "#20242d",
                                        fontSize: 15,
                                        fontFamily: Fonts.semiBold,
                                    }}
                                >
                                    {set.weight}
                                </Text>
                                <Text
                                    style={{
                                        flex: 1,
                                        color: "#20242d",
                                        fontSize: 15,
                                        fontFamily: Fonts.semiBold,
                                    }}
                                >
                                    {set.reps}
                                </Text>
                            </>
                        )}
                    </View>
                );
            })}

            <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                    onPress={onAddSet}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "#1263df",
                        paddingVertical: 10,
                    }}
                >
                    <Ionicons name="add" size={16} color="#1263df" />
                    <Text style={{ color: "#1263df", fontSize: 13, fontFamily: Fonts.bold }}>
                        Add Set
                    </Text>
                </Pressable>

                <Pressable
                    onPress={onRepeatLastSet}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        borderRadius: 14,
                        backgroundColor: "#F0F0F3",
                        paddingVertical: 10,
                    }}
                >
                    <Ionicons name="refresh" size={16} color="#4b4f58" />
                    <Text style={{ color: "#4b4f58", fontSize: 13, fontFamily: Fonts.bold }}>
                        Repeat Last Set
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default ExerciseTrackerCard;
