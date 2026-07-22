import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Modal, Pressable, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import appJson from "../../app.json";

import BottomNav from "@/components/custom/BottomNav";
import Header from "@/components/custom/Header";
import ScreenContent from "@/components/wrappers/ScreenWrapper";
import { Fonts } from "@/constants/fonts";
import { getProfile, Profile, saveProfile } from "@/db/profile";

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

const THEMES = ["Light", "Dark", "System"] as const;

const SettingsRow = ({
    icon,
    mcIcon,
    label,
    value,
    onPress,
}: {
    icon?: IconName | null;
    mcIcon?: MCIconName | null;
    label: string;
    value: string;
    onPress?: () => void;
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
            {icon ? <Ionicons name={icon} size={18} color="#60646C" /> : null}
            {mcIcon ? <MaterialCommunityIcons name={mcIcon} size={18} color="#60646C" /> : null}
            <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.medium }}>{label}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "#9599a5", fontSize: 14, fontFamily: Fonts.regular }}>{value}</Text>
            {onPress ? <Ionicons name="chevron-forward" size={16} color="#D8DBE3" /> : null}
        </View>
    </Pressable>
);

const SectionCard = ({ children }: { children: ReactNode }) => (
    <View
        style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            paddingHorizontal: 16,
            marginBottom: 20,
        }}
    >
        {children}
    </View>
);

const Divider = () => <View style={{ height: 1, backgroundColor: "#F0F0F3" }} />;

export default function SettingsScreen() {
    const [profile, setProfile] = useState<Profile | null>(() => getProfile());
    const [editingField, setEditingField] = useState<FieldConfig | null>(null);
    const [draftValue, setDraftValue] = useState("");
    const [error, setError] = useState("");
    const [theme, setTheme] = useState<(typeof THEMES)[number]>("Light");
    const [remindersEnabled, setRemindersEnabled] = useState(true);

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

        saveProfile({
            name: updated.name,
            age: updated.age,
            weightKg: updated.weight_kg,
            heightCm: updated.height_cm,
        });
        setProfile(updated);
        closeEditor();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
            <ScreenContent>
                <Header />

                <View style={{ marginTop: 16, marginBottom: 20, gap: 4 }}>
                    <Text style={{ color: "#20242d", fontSize: 26, fontFamily: Fonts.bold }}>
                        Settings
                    </Text>
                    <Text style={{ color: "#9599a5", fontSize: 14, fontFamily: Fonts.regular }}>
                        Customize your fitbug experience.
                    </Text>
                </View>

                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Account
                </Text>
                <SectionCard>
                    {profile
                        ? ACCOUNT_FIELDS.map((field, index) => (
                              <View key={field.key}>
                                  <SettingsRow
                                      icon={field.icon}
                                      mcIcon={field.mcIcon}
                                      label={field.label}
                                      value={field.getValue(profile)}
                                      onPress={() => openEditor(field)}
                                  />
                                  {index < ACCOUNT_FIELDS.length - 1 ? <Divider /> : null}
                              </View>
                          ))
                        : null}
                </SectionCard>

                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Appearance
                </Text>
                <SectionCard>
                    <View style={{ paddingVertical: 14, gap: 10 }}>
                        <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.medium }}>
                            Theme
                        </Text>
                        <View style={{ flexDirection: "row", backgroundColor: "#F0F0F3", borderRadius: 16, padding: 3 }}>
                            {THEMES.map((option) => {
                                const selected = option === theme;
                                return (
                                    <Pressable
                                        key={option}
                                        onPress={() => setTheme(option)}
                                        style={{
                                            flex: 1,
                                            alignItems: "center",
                                            paddingVertical: 8,
                                            borderRadius: 13,
                                            backgroundColor: selected ? "#ffffff" : "transparent",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: selected ? "#20242d" : "#9599a5",
                                                fontFamily: selected ? Fonts.bold : Fonts.medium,
                                            }}
                                        >
                                            {option}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </SectionCard>

                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Daily Reminder
                </Text>
                <SectionCard>
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 14,
                        }}
                    >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                            <Ionicons name="notifications-outline" size={18} color="#60646C" />
                            <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.medium }}>
                                Workout Reminders
                            </Text>
                        </View>
                        <Switch
                            value={remindersEnabled}
                            onValueChange={setRemindersEnabled}
                            trackColor={{ true: "#1263df", false: "#D8DBE3" }}
                            thumbColor="#ffffff"
                        />
                    </View>
                    {remindersEnabled ? (
                        <>
                            <Divider />
                            <SettingsRow label="Reminder Time" value="6:00 PM" />
                        </>
                    ) : null}
                </SectionCard>

                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    Data
                </Text>
                <SectionCard>
                    <SettingsRow icon="download-outline" label="Import Data" value="" onPress={() => {}} />
                    <Divider />
                    <SettingsRow icon="share-outline" label="Export Data" value="" onPress={() => {}} />
                </SectionCard>

                <Text style={{ color: "#20242d", fontSize: 16, fontFamily: Fonts.bold, marginBottom: 10 }}>
                    About
                </Text>
                <SectionCard>
                    <SettingsRow icon="information-circle-outline" label="App Version" value={`v${appJson.expo.version}`} />
                    <Divider />
                    <SettingsRow icon="lock-closed-outline" label="Privacy Policy" value="" onPress={() => {}} />
                    <Divider />
                    <SettingsRow icon="document-text-outline" label="Terms & Conditions" value="" onPress={() => {}} />
                    <Divider />
                    <SettingsRow icon="chatbubble-ellipses-outline" label="Contact Support" value="" onPress={() => {}} />
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
                    <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 20, gap: 14 }}>
                        <Text style={{ color: "#20242d", fontSize: 17, fontFamily: Fonts.bold }}>
                            Edit {editingField?.label}
                        </Text>
                        <TextInput
                            value={draftValue}
                            onChangeText={setDraftValue}
                            keyboardType={editingField?.numeric ? "numeric" : "default"}
                            autoFocus
                            style={{
                                backgroundColor: "#EDEEF2",
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                color: "#20242d",
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
                                    backgroundColor: "#F0F0F3",
                                }}
                            >
                                <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.bold }}>
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
        </SafeAreaView>
    );
}
