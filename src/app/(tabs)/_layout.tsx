import type { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import BottomNavBar, { BottomNavItem } from "@/components/custom/BottomNavBar";

type IconName = ComponentProps<typeof Ionicons>["name"];

const TAB_CONFIG: { routeName: string; label: string; icon: IconName }[] = [
    { routeName: "index", label: "Home", icon: "home" },
    { routeName: "history", label: "History", icon: "time-outline" },
    { routeName: "progress", label: "Progress", icon: "stats-chart-outline" },
    { routeName: "settings", label: "Settings", icon: "settings-outline" },
];

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{ headerShown: false, animation: "fade" }}
            tabBar={({ state, navigation }) => {
                const items: BottomNavItem[] = state.routes.map((route, index) => {
                    const config = TAB_CONFIG.find((tab) => tab.routeName === route.name);
                    return {
                        key: route.key,
                        label: config?.label ?? route.name,
                        icon: config?.icon ?? "ellipse",
                        active: state.index === index,
                        onPress: () => navigation.navigate(route.name),
                    };
                });
                return <BottomNavBar items={items} />;
            }}
        >
            {TAB_CONFIG.map((tab) => (
                <Tabs.Screen key={tab.routeName} name={tab.routeName} />
            ))}
        </Tabs>
    );
}
