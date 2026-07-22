import { Fonts } from "@/constants/fonts";
import { useAppTheme } from "@/theme/ThemeProvider";
import { Text, View } from 'react-native';

type StreakProps = {
    name: string;
    daysThisMonth: number;
};

const Streak = ({ name, daysThisMonth }: StreakProps) => {
    const { colors } = useAppTheme();

    return (
        <View
            style={{
                paddingVertical: 16
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <View style={{ gap: 4 }}>
                    <Text
                        selectable
                        style={{
                            color: colors.textPrimary,
                            fontSize: 20,
                            lineHeight: 28,
                            letterSpacing: -0.4,
                            fontFamily: Fonts.bold,
                        }}
                    >
                        Hi, {name}
                    </Text>
                    <Text selectable style={{
                        color: colors.textSecondary, fontSize: 12, lineHeight: 14,
                        fontFamily: Fonts.regular,
                    }}>
                        Let&apos;s crush today&apos;s goals.
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                        paddingHorizontal: 11,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: "#fff3ee",
                    }}
                >
                    <Text selectable style={{ color: "#ee6d3a", fontSize: 13 }}>
                        🔥
                    </Text>
                    <Text selectable style={{ color: "#a45337", fontSize: 10, fontWeight: "800" }}>
                        {daysThisMonth} {daysThisMonth === 1 ? "Day" : "Days"}
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default Streak