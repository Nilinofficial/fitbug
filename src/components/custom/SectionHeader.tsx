import { Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { useAppTheme } from "@/theme/ThemeProvider";

type SectionHeaderProps = {
    title: string;
    rightLabel?: string;
    onRightPress?: () => void;
};

const SectionHeader = ({ title, rightLabel = "See all", onRightPress }: SectionHeaderProps) => {
    const { colors } = useAppTheme();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
            }}
        >
            <Text
                selectable
                style={{
                    color: colors.textPrimary,
                    fontSize: 16,
                    fontFamily: Fonts.bold,
                }}
            >
                {title}
            </Text>
            {rightLabel ? (
                onRightPress ? (
                    <Pressable onPress={onRightPress} hitSlop={8}>
                        <Text
                            selectable
                            style={{
                                color: "#1263df",
                                fontSize: 13,
                                fontFamily: Fonts.medium,
                            }}
                        >
                            {rightLabel}
                        </Text>
                    </Pressable>
                ) : (
                    <Text
                        selectable
                        style={{
                            color: "#1263df",
                            fontSize: 13,
                            fontFamily: Fonts.medium,
                        }}
                    >
                        {rightLabel}
                    </Text>
                )
            ) : null}
        </View>
    );
};

export default SectionHeader;
