import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import Avatar from "@/components/custom/Avatar";
import { getProfile } from "@/db/profile";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useAppTheme } from "@/theme/ThemeProvider";

const Header = () => {
    const { scheme, colors, setPreference } = useAppTheme();
    const [profile, setProfile] = useState(() => getProfile());

    useFocusRefresh(() => setProfile(getProfile()));

    return (
        <View
            style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",

            }}
        >
            <Avatar uri={profile?.profile_picture} gender={profile?.gender} size={36} />

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
