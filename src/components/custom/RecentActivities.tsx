import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import MonthHeatmap from "@/components/custom/MonthHeatmap";
import SectionHeader from "@/components/custom/SectionHeader";
import { Fonts } from "@/constants/fonts";
import { useAppTheme } from "@/theme/ThemeProvider";

const RecentActivities = () => {
    const router = useRouter();
    const { colors } = useAppTheme();
    const now = new Date();

    return (
        <View
            style={{
                backgroundColor: colors.surfaceMuted,
                borderRadius: 20,
                padding: 16,
            }}
        >
            <SectionHeader
                title="Recent activities"
                onRightPress={() => router.push("/activity-history")}
            />

            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 14,
                    gap: 14,
                }}
            >
                <MonthHeatmap
                    year={now.getFullYear()}
                    month={now.getMonth()}
                    onDayPress={(dateISO) => router.push({ pathname: "/workout", params: { date: dateISO } })}
                />

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontFamily: Fonts.regular }}>Less</Text>
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.surfaceMuted }} />
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "#86EFAC" }} />
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "#16A34A" }} />
                    <Text style={{ color: colors.textSecondary, fontSize: 10, fontFamily: Fonts.regular }}>More</Text>
                </View>
            </View>
        </View>
    );
};

export default RecentActivities;
