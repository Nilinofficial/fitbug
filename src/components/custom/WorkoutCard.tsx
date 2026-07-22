import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";

const WorkoutCard = () => {
    const router = useRouter();

    return (
        <LinearGradient
            colors={["#F3EFFE", "#EAF2FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
                borderRadius: 20,
                padding: 20,
                gap: 20,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View style={{ gap: 4 }}>
                    <Text
                        selectable
                        style={{
                            color: "#20242d",
                            fontSize: 18,
                            fontFamily: Fonts.bold,
                        }}
                    >
                        Ready to sweat?
                    </Text>
                    <Text
                        selectable
                        style={{
                            color: "#9599a5",
                            fontSize: 13,
                            fontFamily: Fonts.regular,
                        }}
                    >
                        Suggested: Core Crusher
                    </Text>
                </View>

                <View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: "#E4DEFB",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="barbell" size={26} color="#1263df" />
                </View>
            </View>

            <Pressable
                onPress={() => router.push("/workout")}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    backgroundColor: "#1263df",
                    borderRadius: 30,
                    paddingVertical: 14,
                }}
            >
                <View
                    style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#ffffff",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="play" size={14} color="#1263df" />
                </View>
                <Text
                    selectable
                    style={{
                        color: "#ffffff",
                        fontSize: 15,
                        fontFamily: Fonts.bold,
                    }}
                >
                    Start Workout
                </Text>
            </Pressable>
        </LinearGradient>
    );
};

export default WorkoutCard;
