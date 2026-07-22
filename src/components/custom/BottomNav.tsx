import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { useAppTheme } from "@/theme/ThemeProvider";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Tab = {
    key: string;
    label: string;
    icon: IconName;
    href: "/" | "/history" | "/progress" | "/settings" | null;
    isActive: (pathname: string) => boolean;
};

const TABS: Tab[] = [
    {
        key: "home",
        label: "Home",
        icon: "home",
        href: "/",
        isActive: (pathname) => pathname === "/",
    },
    {
        key: "history",
        label: "History",
        icon: "time-outline",
        href: "/history",
        isActive: (pathname) => pathname.startsWith("/history") || pathname.startsWith("/workout-details"),
    },
    {
        key: "progress",
        label: "Progress",
        icon: "stats-chart-outline",
        href: "/progress",
        isActive: (pathname) => pathname.startsWith("/progress"),
    },
    {
        key: "settings",
        label: "Settings",
        icon: "settings-outline",
        href: "/settings",
        isActive: (pathname) => pathname.startsWith("/settings"),
    },
];

const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { colors } = useAppTheme();

    return (
        <View
            style={{
                position: "absolute",
                left: 20,
                right: 20,
                bottom: Spacing.lg,
                minHeight: 64,
                borderRadius: 32,
                backgroundColor: colors.surface,
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
            {TABS.map((tab) => {
                const active = tab.isActive(pathname);

                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => {
                            if (tab.href) router.navigate(tab.href);
                        }}
                        style={{ alignItems: "center", gap: 4 }}
                    >
                        {active ? (
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
                                <Ionicons name={tab.icon} size={20} color="#ffffff" />
                            </View>
                        ) : (
                            <Ionicons name={tab.icon} size={22} color={colors.textSecondary} />
                        )}
                        <Text
                            style={{
                                fontSize: 10,
                                color: active ? "#1263df" : colors.textSecondary,
                                fontFamily: active ? Fonts.bold : Fonts.medium,
                            }}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

export default BottomNav;
