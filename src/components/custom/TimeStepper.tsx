import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";

type TimeStepperProps = {
    hour24: number;
    minute: number;
    onChange: (hour24: number, minute: number) => void;
    textColor: string;
    buttonBg: string;
};

const to12Hour = (hour24: number) => hour24 % 12 || 12;
const formatPeriod = (hour24: number) => (hour24 >= 12 ? "PM" : "AM");

const TimeStepper = ({ hour24, minute, onChange, textColor, buttonBg }: TimeStepperProps) => {
    const adjustHour = (delta: number) => {
        onChange((hour24 + delta + 24) % 24, minute);
    };

    const adjustMinute = (delta: number) => {
        let newMinute = minute + delta;
        let newHour = hour24;
        if (newMinute < 0) {
            newMinute += 60;
            newHour = (newHour - 1 + 24) % 24;
        }
        if (newMinute >= 60) {
            newMinute -= 60;
            newHour = (newHour + 1) % 24;
        }
        onChange(newHour, newMinute);
    };

    const togglePeriod = () => onChange((hour24 + 12) % 24, minute);

    const circleStyle = {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: buttonBg,
        alignItems: "center" as const,
        justifyContent: "center" as const,
    };

    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => adjustHour(1)} style={circleStyle}>
                    <Ionicons name="chevron-up" size={16} color={textColor} />
                </Pressable>
                <Text style={{ color: textColor, fontSize: 26, fontFamily: Fonts.bold, minWidth: 32, textAlign: "center" }}>
                    {to12Hour(hour24)}
                </Text>
                <Pressable onPress={() => adjustHour(-1)} style={circleStyle}>
                    <Ionicons name="chevron-down" size={16} color={textColor} />
                </Pressable>
            </View>

            <Text style={{ color: textColor, fontSize: 26, fontFamily: Fonts.bold }}>:</Text>

            <View style={{ alignItems: "center", gap: 6 }}>
                <Pressable onPress={() => adjustMinute(5)} style={circleStyle}>
                    <Ionicons name="chevron-up" size={16} color={textColor} />
                </Pressable>
                <Text style={{ color: textColor, fontSize: 26, fontFamily: Fonts.bold, minWidth: 32, textAlign: "center" }}>
                    {minute.toString().padStart(2, "0")}
                </Text>
                <Pressable onPress={() => adjustMinute(-5)} style={circleStyle}>
                    <Ionicons name="chevron-down" size={16} color={textColor} />
                </Pressable>
            </View>

            <Pressable
                onPress={togglePeriod}
                style={{ backgroundColor: buttonBg, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 10 }}
            >
                <Text style={{ color: textColor, fontSize: 14, fontFamily: Fonts.bold }}>
                    {formatPeriod(hour24)}
                </Text>
            </Pressable>
        </View>
    );
};

export default TimeStepper;
