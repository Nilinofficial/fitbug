import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import appJson from "../../app.json";

import InfoDialog from "@/components/custom/InfoDialog";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/theme/ThemeProvider";

const SUPPORT_EMAIL = "buglabs.team@gmail.com";

type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type FeedbackType = "bug" | "feature" | "general";

const FEEDBACK_TYPES: { label: string; value: FeedbackType; icon: MCIconName; subject: string }[] = [
    { label: "Bug Report", value: "bug", icon: "bug-outline", subject: "Bug Report" },
    { label: "Feature Request", value: "feature", icon: "lightbulb-on-outline", subject: "Feature Request" },
    { label: "General", value: "general", icon: "chat-outline", subject: "General Feedback" },
];

const buildDeviceInfo = () => {
    const appVersion = appJson.expo.version;
    const platform = `${Platform.OS} ${Platform.Version}`;
    const device = Constants.deviceName ?? "Unknown device";
    return `App Version: ${appVersion}\nPlatform: ${platform}\nDevice: ${device}`;
};

export default function ContactSupportScreen() {
    const router = useRouter();
    const { colors } = useAppTheme();
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("bug");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [noMailAppDialog, setNoMailAppDialog] = useState(false);

    const handleSubmit = async () => {
        if (!message.trim()) {
            setError("Please enter a message.");
            return;
        }
        setError("");

        const selected = FEEDBACK_TYPES.find((type) => type.value === feedbackType)!;
        const subject = `FitBug ${selected.subject}`;
        const body = `${message.trim()}\n\n---\n${buildDeviceInfo()}`;
        const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        const canOpen = await Linking.canOpenURL(mailto);
        if (!canOpen) {
            setNoMailAppDialog(true);
            return;
        }

        await Linking.openURL(mailto);
        router.back();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingVertical: Spacing.screenVertical,
                }}
            >
                <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 32 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: colors.textPrimary,
                        fontSize: 18,
                        fontFamily: Fonts.bold,
                        marginRight: 32,
                    }}
                >
                    Contact Support
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingBottom: Spacing.xxl,
                    gap: 24,
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ gap: 6 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 24, fontFamily: Fonts.bold }}>
                        Help us improve FitBug.
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: Fonts.regular }}>
                        We read every message and value your feedback.
                    </Text>
                </View>

                <View style={{ gap: 10 }}>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            fontFamily: Fonts.bold,
                            letterSpacing: 0.6,
                        }}
                    >
                        FEEDBACK TYPE
                    </Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {FEEDBACK_TYPES.map((type) => {
                            const selected = feedbackType === type.value;
                            return (
                                <Pressable
                                    key={type.value}
                                    onPress={() => setFeedbackType(type.value)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                        paddingHorizontal: 20,
                                        paddingVertical: 16,
                                        borderRadius: 30,
                                        backgroundColor: selected ? "#1263df" : colors.surface,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={type.icon}
                                        size={18}
                                        color={selected ? "#ffffff" : colors.textPrimary}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: selected ? "#ffffff" : colors.textPrimary,
                                            fontFamily: selected ? Fonts.bold : Fonts.medium,
                                        }}
                                    >
                                        {type.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <View style={{ gap: 10 }}>
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: 12,
                            fontFamily: Fonts.bold,
                            letterSpacing: 0.6,
                        }}
                    >
                        MESSAGE
                    </Text>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Tell us what's on your mind..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        textAlignVertical="top"
                        style={{
                            backgroundColor: colors.surface,
                            borderRadius: 20,
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            minHeight: 220,
                            color: colors.textPrimary,
                            fontSize: 15,
                            fontFamily: Fonts.regular,
                        }}
                    />
                </View>

                {error ? (
                    <Text style={{ color: "#e2703a", fontSize: 13, fontFamily: Fonts.medium }}>
                        {error}
                    </Text>
                ) : null}

                <View
                    style={{
                        flexDirection: "row",
                        gap: 10,
                        backgroundColor: colors.surfaceMuted,
                        borderRadius: 16,
                        padding: 14,
                    }}
                >
                    <Ionicons name="information-circle-outline" size={18} color="#1263df" />
                    <Text
                        style={{
                            flex: 1,
                            color: colors.textSecondary,
                            fontSize: 12,
                            fontFamily: Fonts.regular,
                            lineHeight: 17,
                        }}
                    >
                        App version and device info will be included with your feedback to help our team assist you
                        better.
                    </Text>
                </View>

                <Pressable
                    onPress={handleSubmit}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        backgroundColor: "#1263df",
                        borderRadius: 30,
                        paddingVertical: 16,
                    }}
                >
                    <Text style={{ color: "#ffffff", fontSize: 16, fontFamily: Fonts.bold }}>
                        Submit Feedback
                    </Text>
                    <Ionicons name="send" size={16} color="#ffffff" />
                </Pressable>
            </ScrollView>

            <InfoDialog
                visible={noMailAppDialog}
                title="No mail app found"
                message={`Please email us directly at ${SUPPORT_EMAIL}.`}
                onClose={() => setNoMailAppDialog(false)}
            />
        </SafeAreaView>
    );
}
