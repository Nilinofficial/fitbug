import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { View } from "react-native";

import { Gender } from "@/db/profile";
import { useAppTheme } from "@/theme/ThemeProvider";

type AvatarProps = {
    uri?: string | null;
    gender?: Gender | null;
    size: number;
};

const Avatar = ({ uri, gender, size }: AvatarProps) => {
    const { colors } = useAppTheme();
    const isFemale = gender === "female";

    if (uri) {
        return (
            <Image
                source={{ uri }}
                contentFit="cover"
                style={{ width: size, height: size, borderRadius: size / 2 }}
            />
        );
    }

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isFemale ? colors.tintOrangeBg : colors.tintBlueBg,
            }}
        >
            <Ionicons
                name={isFemale ? "woman" : "man"}
                size={size * 0.58}
                color={isFemale ? "#e2703a" : "#1263df"}
            />
        </View>
    );
};

export default Avatar;
