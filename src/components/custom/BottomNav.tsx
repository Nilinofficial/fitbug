import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";

import BottomNavBar, { BottomNavItem } from "@/components/custom/BottomNavBar";

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

/**
 * Standalone version of the floating tab bar, for screens that live outside
 * the (tabs) group (e.g. workout-details) but still want it visible. Screens
 * inside (tabs) get the bar automatically via Tabs' custom `tabBar` prop —
 * see src/app/(tabs)/_layout.tsx.
 */
const BottomNav = () => {
    const router = useRouter();
    const pathname = usePathname();

    const items: BottomNavItem[] = TABS.map((tab) => ({
        key: tab.key,
        label: tab.label,
        icon: tab.icon,
        active: tab.isActive(pathname),
        onPress: () => {
            if (tab.href) router.navigate(tab.href);
        },
    }));

    return <BottomNavBar items={items} />;
};

export default BottomNav;
