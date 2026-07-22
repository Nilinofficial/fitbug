import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { useAppTheme } from "@/theme/ThemeProvider";
import { WorkoutExercise } from "@/types/workout";

type ExerciseTrackerCardProps = {
    exercise: WorkoutExercise;
    onAddSet: () => void;
    onRepeatLastSet: () => void;
    onUpdateSet: (setId: string, field: "weight" | "reps", delta: number) => void;
    onSetValue: (setId: string, field: "weight" | "reps", value: number) => void;
    onRemove: () => void;
};

type NumberFieldProps = {
    value: number;
    onChange: (value: number) => void;
    color: string;
};

const NumberField = ({ value, onChange, color }: NumberFieldProps) => {
    const [text, setText] = useState(String(value));
    const focused = useRef(false);

    useEffect(() => {
        if (!focused.current) setText(String(value));
    }, [value]);

    return (
        <TextInput
            value={text}
            onFocus={() => {
                focused.current = true;
            }}
            onBlur={() => {
                focused.current = false;
                const parsed = parseFloat(text);
                const next = Number.isFinite(parsed) ? Math.max(0, parsed) : value;
                setText(String(next));
                if (next !== value) onChange(next);
            }}
            onChangeText={(next) => {
                setText(next);
                const parsed = parseFloat(next);
                if (Number.isFinite(parsed)) onChange(Math.max(0, parsed));
            }}
            selectTextOnFocus
            keyboardType="decimal-pad"
            style={{
                color,
                fontSize: 15,
                fontFamily: Fonts.semiBold,
                minWidth: 40,
                textAlign: "center",
                padding: 0,
            }}
        />
    );
};

const ExerciseTrackerCard = ({
    exercise,
    onAddSet,
    onRepeatLastSet,
    onUpdateSet,
    onSetValue,
    onRemove,
}: ExerciseTrackerCardProps) => {
    const { colors } = useAppTheme();

    const lastSet = exercise.sets[exercise.sets.length - 1];
    const canRepeat = Boolean(lastSet && (lastSet.weight > 0 || lastSet.reps > 0));

    const handleRemove = () => {
        Alert.alert("Remove exercise", `Remove ${exercise.name} from this workout?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: onRemove },
        ]);
    };

    return (
        <View
            style={{
                backgroundColor: colors.surface,
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
                        style={{ color: colors.textPrimary, fontSize: 20, fontFamily: Fonts.bold }}
                    >
                        {exercise.name}
                    </Text>
                    <Text
                        selectable
                        style={{ color: colors.textSecondary, fontSize: 13, fontFamily: Fonts.regular }}
                    >
                        {exercise.equipment} · {exercise.muscle}
                    </Text>
                </View>

                <Pressable onPress={handleRemove} hitSlop={8}>
                    <Ionicons name="trash-outline" size={20} color="#e2703a" />
                </Pressable>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 4 }}>
                <Text style={{ width: 44, color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.medium }}>
                    SET
                </Text>
                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontFamily: Fonts.medium,
                    }}
                >
                    KG
                </Text>
                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: colors.textSecondary,
                        fontSize: 11,
                        fontFamily: Fonts.medium,
                    }}
                >
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
                            backgroundColor: isLast ? colors.tintBlueBg : colors.surfaceMuted,
                            borderRadius: 14,
                            paddingVertical: 8,
                            paddingHorizontal: 4,
                        }}
                    >
                        <View style={{ width: 44, alignItems: "center" }}>
                            <View
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: isLast ? "#1263df" : colors.border,
                                }}
                            >
                                <Text
                                    style={{
                                        color: isLast ? "#ffffff" : colors.textSecondary,
                                        fontSize: 13,
                                        fontFamily: Fonts.bold,
                                    }}
                                >
                                    {index + 1}
                                </Text>
                            </View>
                        </View>

                        {isLast ? (
                            <>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Pressable onPress={() => onUpdateSet(set.id, "weight", -2.5)} hitSlop={6}>
                                        <Ionicons name="remove-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                    <NumberField
                                        value={set.weight}
                                        onChange={(value) => onSetValue(set.id, "weight", value)}
                                        color={colors.textPrimary}
                                    />
                                    <Pressable onPress={() => onUpdateSet(set.id, "weight", 2.5)} hitSlop={6}>
                                        <Ionicons name="add-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Pressable onPress={() => onUpdateSet(set.id, "reps", -1)} hitSlop={6}>
                                        <Ionicons name="remove-circle-outline" size={18} color="#1263df" />
                                    </Pressable>
                                    <NumberField
                                        value={set.reps}
                                        onChange={(value) => onSetValue(set.id, "reps", value)}
                                        color={colors.textPrimary}
                                    />
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
                                        textAlign: "center",
                                        color: colors.textPrimary,
                                        fontSize: 15,
                                        fontFamily: Fonts.semiBold,
                                    }}
                                >
                                    {set.weight}
                                </Text>
                                <Text
                                    style={{
                                        flex: 1,
                                        textAlign: "center",
                                        color: colors.textPrimary,
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
                    disabled={!canRepeat}
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        borderRadius: 14,
                        borderWidth: canRepeat ? 1 : 0,
                        borderColor: "#1263df",
                        backgroundColor: canRepeat ? "transparent" : colors.surfaceMuted,
                        paddingVertical: 10,
                    }}
                >
                    <Ionicons name="refresh" size={16} color={canRepeat ? "#1263df" : colors.textSecondary} />
                    <Text
                        style={{
                            color: canRepeat ? "#1263df" : colors.textSecondary,
                            fontSize: 13,
                            fontFamily: Fonts.bold,
                        }}
                    >
                        Repeat Last Set
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};

export default ExerciseTrackerCard;
