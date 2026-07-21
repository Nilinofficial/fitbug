import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import avatar from "../../../assets/images/avatar.png";

const Header = () => {
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
                source={avatar}
                contentFit="cover"
                style={{ width: 36, height: 36, borderRadius: 20 }}
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
                fitbug
            </Text>

            <Ionicons name="notifications" size={28} color="black" />
        </View>
    );
};

export default Header;
