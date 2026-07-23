import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import logo from "@/assets/images/logo.png";
import { useAppTheme } from "@/theme/ThemeProvider";

const Header = () => {
    const { scheme, colors, setPreference } = useAppTheme();

    return (
        <View
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",

            }}
        >
            <Image
                source={logo}
                contentFit="contain"
                style={{ width: 36, height: 36 }}
            />

            <Text
                selectable
                style={{
                    // position: 'absolute',
                    alignSelf: "center",
                    color: "#1263df",
                    fontSize: 24,
                    fontWeight: "800",
                    letterSpacing: -0.8,
                }}
            >
                FitBug
            </Text>

            <Pressable onPress={() => setPreference(scheme === "dark" ? "light" : "dark")} hitSlop={8}>
                <Ionicons
                    name={scheme === "dark" ? "moon" : "sunny"}
                    size={26}
                    color={colors.textPrimary}
                />
            </Pressable>
        </View>
    );
};

export default Header;
