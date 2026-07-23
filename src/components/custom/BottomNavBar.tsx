import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/theme/ThemeProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type BottomNavItem = {
    key: string;
    label: string;
    icon: IconName;
    active: boolean;
    onPress: () => void;
};

type BottomNavBarProps = {
    items: BottomNavItem[];
};

/**
 * Pure presentational floating tab bar. Shared by the Tabs navigator's custom
 * `tabBar` (src/app/(tabs)/_layout.tsx) and the standalone `BottomNav` used on
 * screens that live outside the tabs group (e.g. workout-details) but still
 * want the same bar visible.
 */
const BottomNavBar = ({ items }: BottomNavBarProps) => {
    const { colors } = useAppTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                position: "absolute",
                left: 20,
                right: 20,
                bottom: Spacing.lg + insets.bottom,
                minHeight: 64,
                borderRadius: 32,
                backgroundColor: colors.navBackground,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "space-around",
                paddingVertical: 10,
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
            }}
        >
            {items.map((item) => (
                <Pressable key={item.key} onPress={item.onPress} style={{ alignItems: "center", gap: 4 }}>
                    {item.active ? (
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: "#1263df",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: -22,
                                shadowColor: "#1263df",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 6,
                            }}
                        >
                            <Ionicons name={item.icon} size={20} color="#ffffff" />
                        </View>
                    ) : (
                        <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                    )}
                    <Text
                        style={{
                            fontSize: 10,
                            color: item.active ? "#1263df" : colors.textSecondary,
                            fontFamily: item.active ? Fonts.bold : Fonts.medium,
                        }}
                    >
                        {item.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

export default BottomNavBar;
