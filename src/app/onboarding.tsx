import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import onboardingImage from "@/assets/images/onboarding.png";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { saveProfile } from "@/db/profile";

const MIN_AGE = 1;
const MAX_AGE = 120;

export default function OnboardingScreen() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [error, setError] = useState("");

    const handleAdjustAge = (delta: number) => {
        setAge((prev) => Math.min(MAX_AGE, Math.max(MIN_AGE, prev + delta)));
    };

    const handleSubmit = () => {
        const name = username.trim();
        const heightValue = Number(height);
        const weightValue = Number(weight);

        if (!name) {
            setError("Please enter a username.");
            return;
        }
        if (!Number.isFinite(heightValue) || heightValue <= 0) {
            setError("Please enter a valid height.");
            return;
        }
        if (!Number.isFinite(weightValue) || weightValue <= 0) {
            setError("Please enter a valid weight.");
            return;
        }

        saveProfile({ name, age, weightKg: weightValue, heightCm: heightValue });
        router.replace("/");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingTop: Spacing.screenVertical,
                    paddingBottom: Spacing.xl,
                    gap: 20,
                }}
                showsVerticalScrollIndicator={false}
                bounces={false}
            >
                <View style={{ alignItems: "center"}}>
                 
                    <Text style={{ color: "#1263df", fontSize: 16, fontFamily: Fonts.bold }}>
                        FitBug
                    </Text>
                </View>

                <View style={{ gap: 6, alignItems: "center" }}>
                    <Text
                        style={{
                            color: "#20242d",
                            fontSize: 26,
                            fontFamily: Fonts.bold,
                            textAlign: "center",
                        }}
                    >
                        Welcome to FitBug
                    </Text>
                    <Text
                        style={{
                            color: "#9599a5",
                            fontSize: 14,
                            fontFamily: Fonts.regular,
                            textAlign: "center",
                        }}
                    >
                        Let&apos;s personalize your fitness journey with a few details.
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 20,
                        padding: 16,
                        gap: 6,
                    }}
                >
                    <Text style={{ color: "#20242d", fontSize: 13, fontFamily: Fonts.medium }}>
                        Username
                    </Text>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            backgroundColor: "#EDEEF2",
                            borderRadius: 14,
                            paddingHorizontal: 14,
                        }}
                    >
                        <Ionicons name="person-outline" size={18} color="#60646C" />
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            placeholder="e.g. fitness_warrior"
                            placeholderTextColor="#9599a5"
                            autoCapitalize="none"
                            style={{
                                flex: 1,
                                paddingVertical: 14,
                                color: "#20242d",
                                fontSize: 15,
                                fontFamily: Fonts.regular,
                            }}
                        />
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: "#1263df",
                        borderRadius: 20,
                        padding: 16,
                        gap: 14,
                    }}
                >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialCommunityIcons name="cake-variant-outline" size={16} color="#ffffff" />
                            </View>
                            <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: Fonts.bold }}>
                                Age
                            </Text>
                        </View>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: Fonts.medium }}>
                            years
                        </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Pressable
                            onPress={() => handleAdjustAge(-1)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: "rgba(255,255,255,0.2)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="remove" size={18} color="#ffffff" />
                        </Pressable>

                        <Text style={{ color: "#ffffff", fontSize: 32, fontFamily: Fonts.bold }}>
                            {age}
                        </Text>

                        <Pressable
                            onPress={() => handleAdjustAge(1)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: "rgba(255,255,255,0.2)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons name="add" size={18} color="#ffffff" />
                        </Pressable>
                    </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "#ffffff",
                            borderRadius: 20,
                            padding: 16,
                            gap: 10,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: "#EAF1FE",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialCommunityIcons name="ruler" size={18} color="#1263df" />
                            </View>
                            <View
                                style={{
                                    backgroundColor: "#F0F0F3",
                                    borderRadius: 12,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ color: "#4b4f58", fontSize: 11, fontFamily: Fonts.bold }}>
                                    CM
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.medium }}>
                            Height
                        </Text>
                        <TextInput
                            value={height}
                            onChangeText={setHeight}
                            placeholder="180"
                            placeholderTextColor="#B7C7EF"
                            keyboardType="numeric"
                            style={{
                                color: "#1263df",
                                fontSize: 28,
                                fontFamily: Fonts.bold,
                                padding: 0,
                            }}
                        />
                    </View>

                    <View
                        style={{
                            flex: 1,
                            backgroundColor: "#ffffff",
                            borderRadius: 20,
                            padding: 16,
                            gap: 10,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    backgroundColor: "#FFF1E6",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialCommunityIcons name="scale-bathroom" size={18} color="#e2703a" />
                            </View>
                            <View
                                style={{
                                    backgroundColor: "#F0F0F3",
                                    borderRadius: 12,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ color: "#4b4f58", fontSize: 11, fontFamily: Fonts.bold }}>
                                    KG
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.medium }}>
                            Weight
                        </Text>
                        <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            placeholder="75"
                            placeholderTextColor="#F3C6AE"
                            keyboardType="numeric"
                            style={{
                                color: "#1263df",
                                fontSize: 28,
                                fontFamily: Fonts.bold,
                                padding: 0,
                            }}
                        />
                    </View>
                </View>

                <ImageBackground
                    source={onboardingImage}
                    resizeMode="cover"
                    imageStyle={{ borderRadius: 20 }}
                    style={{
                        borderRadius: 20,
                        height: 140,
                        justifyContent: "flex-end",
                        padding: 14,
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            alignSelf: "flex-start",
                        }}
                    >
                        <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                        <Text style={{ color: "#ffffff", fontSize: 13, fontFamily: Fonts.bold }}>
                            Precision Health Data
                        </Text>
                    </View>
                </ImageBackground>

                {error ? (
                    <Text style={{ color: "#e2703a", fontSize: 13, fontFamily: Fonts.medium, textAlign: "center" }}>
                        {error}
                    </Text>
                ) : null}
            </ScrollView>

            <View
                style={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingTop: Spacing.md,
                    paddingBottom: Spacing.lg,
                    gap: 12,
                }}
            >
                <Pressable
                    onPress={handleSubmit}
                    style={{
                        backgroundColor: "#1263df",
                        borderRadius: 30,
                        paddingVertical: 16,
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: "#ffffff", fontSize: 16, fontFamily: Fonts.bold }}>
                        Get Started
                    </Text>
                </Pressable>

                <Text style={{ color: "#9599a5", fontSize: 12, fontFamily: Fonts.regular, textAlign: "center" }}>
                    By continuing, you agree to our{" "}
                    <Text style={{ color: "#1263df", fontFamily: Fonts.medium }}>Terms & Privacy</Text>.
                </Text>
            </View>
        </SafeAreaView>
    );
}
