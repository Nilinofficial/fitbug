import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import logo from "@/assets/images/logo.png";
import TimeStepper from "@/components/custom/TimeStepper";
import Toast from "@/components/custom/Toast";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { Gender, Goal, saveProfile } from "@/db/profile";
import { formatReminderTime } from "@/lib/format";
import { requestNotificationPermission, scheduleGymReminder } from "@/notifications/reminderNotifications";
import { useAppTheme } from "@/theme/ThemeProvider";

const MIN_AGE = 1;
const MAX_AGE = 120;

const TERMS_URL = "https://fitbug-website.vercel.app/terms";
const PRIVACY_POLICY_URL = "https://fitbug-website.vercel.app/privacy";

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
];

const GOAL_OPTIONS: { label: string; value: Goal; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Lose Fat", value: "fat_loss", icon: "trending-down" },
    { label: "Build Muscle", value: "muscle_gain", icon: "trending-up" },
    { label: "Lose Fat & Build Muscle", value: "recomp", icon: "swap-horizontal" },
    { label: "Maintain", value: "maintain", icon: "remove" },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [username, setUsername] = useState("");
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [goal, setGoal] = useState<Goal | null>(null);
    const [targetWeight, setTargetWeight] = useState("");
    const [reminderHour, setReminderHour] = useState(18);
    const [reminderMinute, setReminderMinute] = useState(0);
    const [timeEditorOpen, setTimeEditorOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showError = (message: string) => {
        setToastMessage(message);
    };

    const handleAdjustAge = (delta: number) => {
        setAge((prev) => Math.min(MAX_AGE, Math.max(MIN_AGE, prev + delta)));
    };

    const handleSubmit = async () => {
        const name = username.trim();
        const heightValue = Number(height);
        const weightValue = Number(weight);
        const targetWeightValue = Number(targetWeight);

        if (!name) {
            showError("Please enter a username.");
            return;
        }
        if (!Number.isFinite(heightValue) || heightValue <= 0) {
            showError("Please enter a valid height.");
            return;
        }
        if (!Number.isFinite(weightValue) || weightValue <= 0) {
            showError("Please enter a valid weight.");
            return;
        }
        if (!goal) {
            showError("Please select a goal.");
            return;
        }
        if (!Number.isFinite(targetWeightValue) || targetWeightValue <= 0) {
            showError("Please enter a valid target weight.");
            return;
        }

        const reminderTime = formatReminderTime(reminderHour, reminderMinute);
        saveProfile({
            name,
            age,
            weightKg: weightValue,
            heightCm: heightValue,
            reminderTime,
            remindersEnabled: true,
            theme: "system",
            gender,
            goal,
            targetWeightKg: targetWeightValue,
        });

        const granted = await requestNotificationPermission();
        if (granted) await scheduleGymReminder(reminderTime);

        router.replace("/");
    };

    const hour12 = reminderHour % 12 || 12;
    const period = reminderHour >= 12 ? "PM" : "AM";
    const minuteLabel = reminderMinute.toString().padStart(2, "0");

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
                <View style={{ alignItems: "center", gap: 20 }}>
                    <Image source={logo} contentFit="contain" style={{ width: 72, height: 72 }} />

                    <View style={{ gap: 8 }}>
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: 26,
                                fontFamily: Fonts.bold,
                                textAlign: "center",
                            }}
                        >
                            Welcome to FitBug
                        </Text>
                        <Text
                            style={{
                                color: colors.textSecondary,
                                fontSize: 14,
                                fontFamily: Fonts.regular,
                                textAlign: "center",
                                lineHeight: 20,
                            }}
                        >
                            Let&apos;s personalize your journey to a healthier lifestyle.
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 24,
                        padding: 20,
                        gap: 20,
                    }}
                >
                    <View style={{ gap: 8 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                            Username
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                                backgroundColor: colors.surfaceMuted,
                                borderRadius: 14,
                                paddingHorizontal: 14,
                            }}
                        >
                            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                            <TextInput
                                value={username}
                                onChangeText={setUsername}
                                placeholder="fitness_enthusiast"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="none"
                                style={{
                                    flex: 1,
                                    paddingVertical: 14,
                                    color: colors.textPrimary,
                                    fontSize: 15,
                                    fontFamily: Fonts.regular,
                                }}
                            />
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                            Gender
                        </Text>
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {GENDER_OPTIONS.map((option) => {
                                const selected = gender === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => setGender(option.value)}
                                        style={{
                                            flex: 1,
                                            alignItems: "center",
                                            paddingVertical: 14,
                                            borderRadius: 14,
                                            backgroundColor: selected ? "#1263df" : colors.surfaceMuted,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: selected ? "#ffffff" : colors.textPrimary,
                                                fontSize: 14,
                                                fontFamily: Fonts.bold,
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.surfaceMuted,
                                borderRadius: 16,
                                padding: 14,
                                gap: 12,
                            }}
                        >
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                Age
                            </Text>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                                <Pressable
                                    onPress={() => handleAdjustAge(-1)}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        backgroundColor: colors.border,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons name="remove" size={16} color={colors.textPrimary} />
                                </Pressable>
                                <Text style={{ color: colors.textPrimary, fontSize: 18, fontFamily: Fonts.bold }}>
                                    {age}
                                </Text>
                                <Pressable
                                    onPress={() => handleAdjustAge(1)}
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: 15,
                                        backgroundColor: "#1263df",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Ionicons name="add" size={16} color="#ffffff" />
                                </Pressable>
                            </View>
                        </View>

                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.surfaceMuted,
                                borderRadius: 16,
                                padding: 14,
                                gap: 12,
                            }}
                        >
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                Gym Time
                            </Text>
                            <Pressable
                                onPress={() => setTimeEditorOpen(true)}
                                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold }}>
                                    {hour12}:{minuteLabel}
                                </Text>
                                <View
                                    style={{
                                        backgroundColor: "#1263df",
                                        borderRadius: 8,
                                        paddingHorizontal: 6,
                                        paddingVertical: 2,
                                    }}
                                >
                                    <Text style={{ color: "#ffffff", fontSize: 10, fontFamily: Fonts.bold }}>
                                        {period}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }} />
                                <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                            </Pressable>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 1, gap: 8 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                Height (cm)
                            </Text>
                            <TextInput
                                value={height}
                                onChangeText={setHeight}
                                placeholder="175"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                style={{
                                    backgroundColor: colors.surfaceMuted,
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 14,
                                    color: colors.textPrimary,
                                    fontSize: 15,
                                    fontFamily: Fonts.regular,
                                }}
                            />
                        </View>

                        <View style={{ flex: 1, gap: 8 }}>
                            <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                                Weight (kg)
                            </Text>
                            <TextInput
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="70"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                style={{
                                    backgroundColor: colors.surfaceMuted,
                                    borderRadius: 14,
                                    paddingHorizontal: 14,
                                    paddingVertical: 14,
                                    color: colors.textPrimary,
                                    fontSize: 15,
                                    fontFamily: Fonts.regular,
                                }}
                            />
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                            Goal
                        </Text>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                            {GOAL_OPTIONS.map((option) => {
                                const selected = goal === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => setGoal(option.value)}
                                        style={{
                                            width: "47%",
                                            alignItems: "center",
                                            gap: 6,
                                            paddingVertical: 14,
                                            paddingHorizontal: 6,
                                            borderRadius: 14,
                                            backgroundColor: selected ? "#1263df" : colors.surfaceMuted,
                                        }}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={18}
                                            color={selected ? "#ffffff" : colors.textSecondary}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 11,
                                                textAlign: "center",
                                                color: selected ? "#ffffff" : colors.textSecondary,
                                                fontFamily: Fonts.bold,
                                            }}
                                        >
                                            {option.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    <View style={{ gap: 8 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.bold }}>
                            Target Weight (kg)
                        </Text>
                        <TextInput
                            value={targetWeight}
                            onChangeText={setTargetWeight}
                            placeholder="65"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                            style={{
                                backgroundColor: colors.surfaceMuted,
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 14,
                                color: colors.textPrimary,
                                fontSize: 15,
                                fontFamily: Fonts.regular,
                            }}
                        />
                    </View>
                </View>
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

                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: 12,
                        fontFamily: Fonts.regular,
                        textAlign: "center",
                        lineHeight: 18,
                    }}
                >
                    By continuing, you agree to our{" "}
                    <Text
                        style={{ color: "#1263df", fontFamily: Fonts.medium }}
                        onPress={() => Linking.openURL(TERMS_URL)}
                    >
                        Terms of Service
                    </Text>{" "}
                    and{" "}
                    <Text
                        style={{ color: "#1263df", fontFamily: Fonts.medium }}
                        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                    >
                        Privacy Policy
                    </Text>
                    .
                </Text>
            </View>

            <Modal
                visible={timeEditorOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setTimeEditorOpen(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(32,36,45,0.4)",
                        justifyContent: "center",
                        paddingHorizontal: 24,
                    }}
                >
                    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 18 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                            Gym Time
                        </Text>

                        <TimeStepper
                            hour24={reminderHour}
                            minute={reminderMinute}
                            onChange={(hour, minute) => {
                                setReminderHour(hour);
                                setReminderMinute(minute);
                            }}
                            textColor={colors.textPrimary}
                            buttonBg={colors.surfaceMuted}
                        />

                        <Pressable
                            onPress={() => setTimeEditorOpen(false)}
                            style={{
                                alignItems: "center",
                                paddingVertical: 12,
                                borderRadius: 30,
                                backgroundColor: "#1263df",
                            }}
                        >
                            <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: Fonts.bold }}>
                                Done
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Toast
                visible={toastMessage !== null}
                message={toastMessage ?? ""}
                variant="error"
                onHide={() => setToastMessage(null)}
            />
        </SafeAreaView>
    );
}
