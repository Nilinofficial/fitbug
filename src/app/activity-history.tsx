import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MonthHeatmap from "@/components/custom/MonthHeatmap";
import { Fonts } from "@/constants/fonts";
import { Spacing } from "@/constants/spacing";
import { getActivityMonthRange } from "@/db/activity";

export default function ActivityHistoryScreen() {
    const router = useRouter();
    const months = getActivityMonthRange();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingVertical: Spacing.screenVertical,
                }}
            >
                <Pressable onPress={() => router.back()} hitSlop={8} style={{ width: 32 }}>
                    <Ionicons name="arrow-back" size={24} color="#1263df" />
                </Pressable>
                <Text
                    style={{
                        flex: 1,
                        textAlign: "center",
                        color: "#1263df",
                        fontSize: 18,
                        fontFamily: Fonts.bold,
                        marginRight: 32,
                    }}
                >
                    Activity History
                </Text>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingHorizontal: Spacing.screenHorizontal,
                    paddingBottom: Spacing.xxl,
                    gap: 16,
                }}
                showsVerticalScrollIndicator={false}
            >
                {months.length === 0 ? (
                    <View style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 16 }}>
                        <Text style={{ color: "#9599a5", fontSize: 13, fontFamily: Fonts.regular }}>
                            No workouts yet — start one from Home.
                        </Text>
                    </View>
                ) : (
                    months.map(({ year, month }) => (
                        <View
                            key={`${year}-${month}`}
                            style={{ backgroundColor: "#ffffff", borderRadius: 16, padding: 14 }}
                        >
                            <MonthHeatmap year={year} month={month} />
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
