import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import SectionHeader from "@/components/custom/SectionHeader";
import { EXERCISE_LIBRARY } from "@/constants/exercises";
import { Fonts } from "@/constants/fonts";
import { getTopPersonalRecords, PersonalRecordRow } from "@/db/workouts";

const FALLBACK_ICON = "barbell" as const;
const FALLBACK_ICON_BG = "#EAF1FE";
const FALLBACK_ICON_COLOR = "#1263df";

const isSameDay = (isoDate: string) => new Date(isoDate).toDateString() === new Date().toDateString();

const PersonalRecords = () => {
    const [records, setRecords] = useState<PersonalRecordRow[]>(() => getTopPersonalRecords(2));

    useFocusEffect(
        useCallback(() => {
            setRecords(getTopPersonalRecords(2));
        }, [])
    );

    return (
        <View>
            <SectionHeader title="Personal Records" rightLabel="" />

            {records.length === 0 ? (
                <View
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 16,
                        padding: 16,
                    }}
                >
                    <Text
                        selectable
                        style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}
                    >
                        Complete a workout to see your personal records here.
                    </Text>
                </View>
            ) : (
                <View style={{ flexDirection: "row", gap: 12 }}>
                    {records.map((record) => {
                        const template = EXERCISE_LIBRARY.find((item) => item.name === record.name);
                        const icon = template?.icon ?? FALLBACK_ICON;
                        const iconBg = template?.iconBg ?? FALLBACK_ICON_BG;
                        const iconColor = template?.iconColor ?? FALLBACK_ICON_COLOR;
                        const isNewToday = isSameDay(record.finished_at);

                        return (
                            <View
                                key={record.name}
                                style={{
                                    flex: 1,
                                    backgroundColor: "#ffffff",
                                    borderRadius: 16,
                                    padding: 14,
                                    gap: 8,
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
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                            backgroundColor: iconBg,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Ionicons name={icon} size={13} color={iconColor} />
                                    </View>
                                    <Text
                                        selectable
                                        style={{
                                            color: "#9599a5",
                                            fontSize: 12,
                                            fontFamily: Fonts.medium,
                                        }}
                                    >
                                        {record.name}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
                                    <Text
                                        selectable
                                        style={{
                                            color: "#20242d",
                                            fontSize: 26,
                                            fontFamily: Fonts.bold,
                                        }}
                                    >
                                        {record.weight_kg}
                                    </Text>
                                    <Text
                                        selectable
                                        style={{
                                            color: "#9599a5",
                                            fontSize: 13,
                                            fontFamily: Fonts.medium,
                                            marginBottom: 3,
                                        }}
                                    >
                                        kg
                                    </Text>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                                    <Ionicons name="repeat-outline" size={12} color="#1263df" />
                                    <Text
                                        selectable
                                        style={{
                                            color: "#1263df",
                                            fontSize: 11,
                                            fontFamily: Fonts.medium,
                                        }}
                                    >
                                        {record.reps} reps
                                    </Text>
                                </View>

                                {isNewToday ? (
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            alignSelf: "flex-start",
                                            gap: 4,
                                            backgroundColor: "#fff3ee",
                                            borderRadius: 10,
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                        }}
                                    >
                                        <Ionicons name="flame" size={11} color="#ee6d3a" />
                                        <Text
                                            selectable
                                            style={{ color: "#a45337", fontSize: 10, fontFamily: Fonts.bold }}
                                        >
                                            New PR today
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

export default PersonalRecords;
