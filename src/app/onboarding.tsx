import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import onboardingImage from "@/assets/images/onboarding.png";
import Avatar from "@/components/custom/Avatar";
import TimeStepper from "@/components/custom/TimeStepper";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { Gender, saveProfile } from "@/db/profile";
import { formatReminderTime } from "@/lib/format";
import { requestNotificationPermission, scheduleGymReminder } from "@/notifications/reminderNotifications";
import { useAppTheme } from "@/theme/ThemeProvider";

const MIN_AGE = 1;
const MAX_AGE = 120;

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [username, setUsername] = useState("");
    const [age, setAge] = useState(25);
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [reminderHour, setReminderHour] = useState(18);
    const [reminderMinute, setReminderMinute] = useState(0);
    const [error, setError] = useState("");

    const handleAdjustAge = (delta: number) => {
        setAge((prev) => Math.min(MAX_AGE, Math.max(MIN_AGE, prev + delta)));
    };

    const handlePickPhoto = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            setError("Photo library permission is required to set a profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
        });

        if (!result.canceled && result.assets[0]) {
            setProfilePicture(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
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
            profilePicture,
        });

        const granted = await requestNotificationPermission();
        if (granted) await scheduleGymReminder(reminderTime);

        router.replace("/");
    };

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
                <View style={{ alignItems: "center"}}>
                 
                    <Text style={{ color: "#1263df", fontSize: 16, fontFamily: Fonts.bold }}>
                        FitBug
                    </Text>
                </View>

                <View style={{ gap: 6, alignItems: "center" }}>
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
                        }}
                    >
                        Let&apos;s personalize your fitness journey with a few details.
                    </Text>
                </View>

                <View style={{ alignItems: "center", gap: 10 }}>
                    <Pressable onPress={handlePickPhoto}>
                        <Avatar uri={profilePicture} gender={gender} size={88} />
                        <View
                            style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: "#1263df",
                                alignItems: "center",
                                justifyContent: "center",
                                borderWidth: 2,
                                borderColor: colors.background,
                            }}
                        >
                            <Ionicons name="camera" size={14} color="#ffffff" />
                        </View>
                    </Pressable>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular }}>
                        {profilePicture ? "Tap to change photo" : "Add a profile photo (optional)"}
                    </Text>
                </View>

                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 20,
                        padding: 16,
                        gap: 10,
                    }}
                >
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.medium }}>
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
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        paddingVertical: 12,
                                        borderRadius: 14,
                                        backgroundColor: selected ? colors.tintBlueBg : colors.surfaceMuted,
                                        borderWidth: selected ? 1 : 0,
                                        borderColor: "#1263df",
                                    }}
                                >
                                    <Ionicons
                                        name={option.value === "female" ? "woman" : "man"}
                                        size={16}
                                        color={selected ? "#1263df" : colors.textSecondary}
                                    />
                                    <Text
                                        style={{
                                            color: selected ? "#1263df" : colors.textSecondary,
                                            fontSize: 13,
                                            fontFamily: selected ? Fonts.bold : Fonts.medium,
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: colors.surface,
                        borderRadius: 20,
                        padding: 16,
                        gap: 6,
                    }}
                >
                    <Text style={{ color: colors.textPrimary, fontSize: 13, fontFamily: Fonts.medium }}>
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
                            placeholder="e.g. fitness_warrior"
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

                <View
                    style={{
                        backgroundColor: colors.surface,
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
                                    backgroundColor: colors.tintBlueBg,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="alarm-outline" size={16} color="#1263df" />
                            </View>
                            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                Gym Time
                            </Text>
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.medium }}>
                            daily
                        </Text>
                    </View>

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
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.surface,
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
                                    backgroundColor: colors.tintBlueBg,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialCommunityIcons name="ruler" size={18} color="#1263df" />
                            </View>
                            <View
                                style={{
                                    backgroundColor: colors.surfaceMuted,
                                    borderRadius: 12,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.bold }}>
                                    CM
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.medium }}>
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
                            backgroundColor: colors.surface,
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
                                    backgroundColor: colors.tintOrangeBg,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialCommunityIcons name="scale-bathroom" size={18} color="#e2703a" />
                            </View>
                            <View
                                style={{
                                    backgroundColor: colors.surfaceMuted,
                                    borderRadius: 12,
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                }}
                            >
                                <Text style={{ color: colors.textSecondary, fontSize: 11, fontFamily: Fonts.bold }}>
                                    KG
                                </Text>
                            </View>
                        </View>
                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.medium }}>
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

                <Text style={{ color: colors.textSecondary, fontSize: 12, fontFamily: Fonts.regular, textAlign: "center" }}>
                    By continuing, you agree to our{" "}
                    <Text style={{ color: "#1263df", fontFamily: Fonts.medium }}>Terms & Privacy</Text>.
                </Text>
            </View>
        </SafeAreaView>
    );
}
