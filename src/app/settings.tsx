import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Alert, Linking, Modal, Pressable, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import appJson from "../../app.json";

import BottomNav from "@/components/custom/BottomNav";
import ConfirmDialog from "@/components/custom/ConfirmDialog";
import Header from "@/components/custom/Header";
import TimeStepper from "@/components/custom/TimeStepper";
import ScreenContent from "@/components/wrappers/ScreenWrapper";
import { Fonts } from "@/constants/fonts";
import { BackupData, exportAllData, importAllData } from "@/db/backup";
import { Gender, getProfile, Profile, saveProfile } from "@/db/profile";
import { formatReminderTime, formatReminderTimeDisplay, parseReminderTime } from "@/lib/format";
import {
    cancelGymReminder,
    requestNotificationPermission,
    scheduleGymReminder,
} from "@/notifications/reminderNotifications";
import { ThemePreference, useAppTheme } from "@/theme/ThemeProvider";
import { ThemeTokens } from "@/theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];
type MCIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type FieldKey = "name" | "age" | "height" | "weight";

type FieldConfig = {
    key: FieldKey;
    label: string;
    numeric: boolean;
    icon: IconName | null;
    mcIcon: MCIconName | null;
    getValue: (profile: Profile) => string;
};

const ACCOUNT_FIELDS: FieldConfig[] = [
    {
        key: "name",
        label: "Name",
        numeric: false,
        icon: "person-outline",
        mcIcon: null,
        getValue: (profile) => profile.name,
    },
    {
        key: "age",
        label: "Age",
        numeric: true,
        icon: null,
        mcIcon: "cake-variant-outline",
        getValue: (profile) => String(profile.age),
    },
    {
        key: "height",
        label: "Height (CM)",
        numeric: true,
        icon: null,
        mcIcon: "ruler",
        getValue: (profile) => String(profile.height_cm),
    },
    {
        key: "weight",
        label: "Weight (KG)",
        numeric: true,
        icon: null,
        mcIcon: "scale-bathroom",
        getValue: (profile) => String(profile.weight_kg),
    },
];

const PRIVACY_POLICY_URL = "https://fitbug-website.vercel.app/privacy";
const TERMS_URL = "https://fitbug-website.vercel.app/terms";

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
];

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
];

const SettingsRow = ({
    icon,
    mcIcon,
    label,
    value,
    onPress,
    colors,
}: {
    icon?: IconName | null;
    mcIcon?: MCIconName | null;
    label: string;
    value: string;
    onPress?: () => void;
    colors: ThemeTokens;
}) => (
    <Pressable
        onPress={onPress}
        style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 14,
        }}
    >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            {icon ? <Ionicons name={icon} size={18} color={colors.textSecondary} /> : null}
            {mcIcon ? <MaterialCommunityIcons name={mcIcon} size={18} color={colors.textSecondary} /> : null}
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.medium }}>{label}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: Fonts.regular }}>{value}</Text>
            {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.border} /> : null}
        </View>
    </Pressable>
);

const SectionCard = ({ children, colors }: { children: ReactNode; colors: ThemeTokens }) => (
    <View
        style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 20,
        }}
    >
        {children}
    </View>
);

const Divider = ({ colors }: { colors: ThemeTokens }) => (
    <View style={{ height: 1, backgroundColor: colors.border }} />
);

export default function SettingsScreen() {
    const router = useRouter();
    const { preference, setPreference, colors } = useAppTheme();
    const [profile, setProfile] = useState<Profile | null>(() => getProfile());
    const [editingField, setEditingField] = useState<FieldConfig | null>(null);
    const [draftValue, setDraftValue] = useState("");
    const [error, setError] = useState("");
    const [timeEditorOpen, setTimeEditorOpen] = useState(false);
    const [draftHour, setDraftHour] = useState(18);
    const [draftMinute, setDraftMinute] = useState(0);
    const [pendingImport, setPendingImport] = useState<BackupData | null>(null);
    const [genderEditorOpen, setGenderEditorOpen] = useState(false);
    const [draftGender, setDraftGender] = useState<Gender>("male");

    const persistProfile = (updated: Profile) => {
        saveProfile({
            name: updated.name,
            age: updated.age,
            weightKg: updated.weight_kg,
            heightCm: updated.height_cm,
            reminderTime: updated.reminder_time,
            remindersEnabled: Boolean(updated.reminders_enabled),
            theme: updated.theme,
            gender: updated.gender,
        });
        setProfile(updated);
    };

    const openGenderEditor = () => {
        if (!profile) return;
        setDraftGender(profile.gender);
        setGenderEditorOpen(true);
    };

    const handleSaveGender = () => {
        if (!profile) return;
        persistProfile({ ...profile, gender: draftGender });
        setGenderEditorOpen(false);
    };

    const openEditor = (field: FieldConfig) => {
        if (!profile) return;
        setEditingField(field);
        setDraftValue(field.getValue(profile));
        setError("");
    };

    const closeEditor = () => {
        setEditingField(null);
        setError("");
    };

    const handleSave = () => {
        if (!profile || !editingField) return;

        if (editingField.numeric) {
            const parsed = Number(draftValue);
            if (!Number.isFinite(parsed) || parsed <= 0) {
                setError("Please enter a valid number.");
                return;
            }
        } else if (!draftValue.trim()) {
            setError("This field can't be empty.");
            return;
        }

        const updated: Profile = { ...profile };
        if (editingField.key === "name") updated.name = draftValue.trim();
        if (editingField.key === "age") updated.age = Number(draftValue);
        if (editingField.key === "height") updated.height_cm = Number(draftValue);
        if (editingField.key === "weight") updated.weight_kg = Number(draftValue);

        persistProfile(updated);
        closeEditor();
    };

    const openTimeEditor = () => {
        if (!profile) return;
        const { hour, minute } = parseReminderTime(profile.reminder_time);
        setDraftHour(hour);
        setDraftMinute(minute);
        setTimeEditorOpen(true);
    };

    const handleSaveTime = async () => {
        if (!profile) return;
        const reminderTime = formatReminderTime(draftHour, draftMinute);
        const updated: Profile = { ...profile, reminder_time: reminderTime };
        setTimeEditorOpen(false);

        if (updated.reminders_enabled) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                persistProfile({ ...updated, reminders_enabled: 0 });
                Alert.alert(
                    "Notifications disabled",
                    "FitBug doesn't have notification permission, so gym reminders were turned off. Enable notifications for FitBug in your device settings, then turn Workout Reminders back on."
                );
                return;
            }
            await scheduleGymReminder(reminderTime);
        }

        persistProfile(updated);
    };

    const handleToggleReminders = async (enabled: boolean) => {
        if (!profile) return;

        if (enabled) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                Alert.alert(
                    "Permission needed",
                    "FitBug needs notification permission to send gym reminders. Enable notifications for FitBug in your device settings and try again."
                );
                return;
            }
            persistProfile({ ...profile, reminders_enabled: 1 });
            await scheduleGymReminder(profile.reminder_time);
        } else {
            persistProfile({ ...profile, reminders_enabled: 0 });
            await cancelGymReminder();
        }
    };

    const handleExportData = async () => {
        try {
            const data = exportAllData();
            const file = new File(Paths.cache, "fitbug-backup.json");
            if (file.exists) file.delete();
            file.create();
            file.write(JSON.stringify(data, null, 2));

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
            } else {
                Alert.alert("Export complete", `Saved to ${file.uri}`);
            }
        } catch {
            Alert.alert("Export failed", "Something went wrong while exporting your data.");
        }
    };

    const handleImportData = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
        if (result.canceled || !result.assets[0]) return;

        try {
            const file = new File(result.assets[0].uri);
            const data = JSON.parse(file.textSync()) as BackupData;
            setPendingImport(data);
        } catch {
            Alert.alert("Import failed", "That file doesn't look like a valid fitbug backup.");
        }
    };

    const confirmImportData = async () => {
        if (!pendingImport) return;
        const data = pendingImport;
        setPendingImport(null);

        importAllData(data);
        const restored = getProfile();
        setProfile(restored);
        if (restored?.reminders_enabled) {
            await scheduleGymReminder(restored.reminder_time);
        } else {
            await cancelGymReminder();
        }
        Alert.alert("Import complete", "Your data has been restored.");
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <ScreenContent>
                <Header />

                <View style={{ marginTop: 16, marginBottom: 20, gap: 4 }}>
                    <Text style={{ color: colors.textPrimary, fontSize: 26, fontFamily: Fonts.bold }}>
                        Settings
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 14, fontFamily: Fonts.regular }}>
                        Customize your fitbug experience.
                    </Text>
                </View>

                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Account
                </Text>
                <SectionCard colors={colors}>
                    {profile
                        ? ACCOUNT_FIELDS.map((field) => (
                              <View key={field.key}>
                                  <SettingsRow
                                      icon={field.icon}
                                      mcIcon={field.mcIcon}
                                      label={field.label}
                                      value={field.getValue(profile)}
                                      onPress={() => openEditor(field)}
                                      colors={colors}
                                  />
                                  <Divider colors={colors} />
                              </View>
                          ))
                        : null}
                    {profile ? (
                        <SettingsRow
                            icon={profile.gender === "female" ? "woman-outline" : "man-outline"}
                            label="Gender"
                            value={profile.gender === "female" ? "Female" : "Male"}
                            onPress={openGenderEditor}
                            colors={colors}
                        />
                    ) : null}
                </SectionCard>

                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Goal
                </Text>
                <SectionCard colors={colors}>
                    <SettingsRow
                        icon="flag-outline"
                        label="Target Weight & Goal"
                        value={profile?.target_weight_kg != null ? `${profile.target_weight_kg} kg` : "Not set"}
                        onPress={() => router.push("/goal")}
                        colors={colors}
                    />
                </SectionCard>

                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Appearance
                </Text>
                <SectionCard colors={colors}>
                    <View style={{ paddingVertical: 14, gap: 10 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.medium }}>
                            Theme
                        </Text>
                        <View style={{ flexDirection: "row", backgroundColor: colors.surfaceMuted, borderRadius: 16, padding: 3 }}>
                            {THEME_OPTIONS.map((option) => {
                                const selected = option.value === preference;
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => setPreference(option.value)}
                                        style={{
                                            flex: 1,
                                            alignItems: "center",
                                            paddingVertical: 8,
                                            borderRadius: 13,
                                            backgroundColor: selected ? colors.surface : "transparent",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: selected ? colors.textPrimary : colors.textSecondary,
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
                </SectionCard>

                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Daily Reminder
                </Text>
                <SectionCard colors={colors}>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 14,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
                            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.medium }}>
                                Workout Reminders
                            </Text>
                        </View>
                        <Switch
                            value={Boolean(profile?.reminders_enabled)}
                            onValueChange={handleToggleReminders}
                            trackColor={{ true: "#1263df", false: colors.border }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    {profile?.reminders_enabled ? (
                        <>
                            <Divider colors={colors} />
                            <SettingsRow
                                label="Gym Time"
                                value={formatReminderTimeDisplay(profile.reminder_time)}
                                onPress={openTimeEditor}
                                colors={colors}
                            />
                        </>
                    ) : null}
                </SectionCard>

                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Data
                </Text>
                <SectionCard colors={colors}>
                    <SettingsRow icon="download-outline" label="Import Data" value="" onPress={handleImportData} colors={colors} />
                    <Divider colors={colors} />
                    <SettingsRow icon="share-outline" label="Export Data" value="" onPress={handleExportData} colors={colors} />
                </SectionCard>

                <Text style={{ color: colors.textPrimary, fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    About
                </Text>
                <SectionCard colors={colors}>
                    <SettingsRow icon="information-circle-outline" label="App Version" value={`v${appJson.expo.version}`} colors={colors} />
                    <Divider colors={colors} />
                    <SettingsRow
                        icon="lock-closed-outline"
                        label="Privacy Policy"
                        value=""
                        onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <SettingsRow
                        icon="document-text-outline"
                        label="Terms & Conditions"
                        value=""
                        onPress={() => Linking.openURL(TERMS_URL)}
                        colors={colors}
                    />
                    <Divider colors={colors} />
                    <SettingsRow
                        icon="chatbubble-ellipses-outline"
                        label="Contact Support"
                        value=""
                        onPress={() => router.push("/contact-support")}
                        colors={colors}
                    />
                </SectionCard>
            </ScreenContent>

            <BottomNav />

            <Modal visible={editingField !== null} transparent animationType="fade" onRequestClose={closeEditor}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(32,36,45,0.4)",
                        justifyContent: "center",
                        paddingHorizontal: 24,
                    }}
                >
                    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 14 }}>
                        <Text style={{ color: colors.textPrimary, fontSize: 17, fontFamily: Fonts.bold }}>
                            Edit {editingField?.label}
                        </Text>
                        <TextInput
                            value={draftValue}
                            onChangeText={setDraftValue}
                            keyboardType={editingField?.numeric ? "numeric" : "default"}
                            autoFocus
                            style={{
                                backgroundColor: colors.surfaceMuted,
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                color: colors.textPrimary,
                                fontSize: 15,
                                fontFamily: Fonts.regular,
                            }}
                        />
                        {error ? (
                            <Text style={{ color: "#e2703a", fontSize: 12, fontFamily: Fonts.medium }}>
                                {error}
                            </Text>
                        ) : null}
                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Pressable
                                onPress={closeEditor}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderRadius: 30,
                                    backgroundColor: colors.surfaceMuted,
                                }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSave}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderRadius: 30,
                                    backgroundColor: "#1263df",
                                }}
                            >
                                <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: Fonts.bold }}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={timeEditorOpen} transparent animationType="fade" onRequestClose={() => setTimeEditorOpen(false)}>
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
                            hour24={draftHour}
                            minute={draftMinute}
                            onChange={(hour, minute) => {
                                setDraftHour(hour);
                                setDraftMinute(minute);
                            }}
                            textColor={colors.textPrimary}
                            buttonBg={colors.surfaceMuted}
                        />

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Pressable
                                onPress={() => setTimeEditorOpen(false)}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderRadius: 30,
                                    backgroundColor: colors.surfaceMuted,
                                }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSaveTime}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderRadius: 30,
                                    backgroundColor: "#1263df",
                                }}
                            >
                                <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: Fonts.bold }}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={genderEditorOpen} transparent animationType="fade" onRequestClose={() => setGenderEditorOpen(false)}>
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
                            Gender
                        </Text>

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            {GENDER_OPTIONS.map((option) => {
                                const selected = draftGender === option.value;
                                return (
                                    <Pressable
                                        key={option.value}
                                        onPress={() => setDraftGender(option.value)}
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

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <Pressable
                                onPress={() => setGenderEditorOpen(false)}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderRadius: 30,
                                    backgroundColor: colors.surfaceMuted,
                                }}
                            >
                                <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={handleSaveGender}
                                style={{
                                    flex: 1,
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    borderRadius: 30,
                                    backgroundColor: "#1263df",
                                }}
                            >
                                <Text style={{ color: "#ffffff", fontSize: 14, fontFamily: Fonts.bold }}>
                                    Save
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <ConfirmDialog
                visible={pendingImport !== null}
                title="Import data"
                message="This replaces all current data on this device (profile, workouts, and custom workouts) with the contents of this backup. Continue?"
                confirmLabel="Import"
                onConfirm={confirmImportData}
                onCancel={() => setPendingImport(null)}
            />
        </SafeAreaView>
    );
}
