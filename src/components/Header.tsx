import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text, View } from "react-native";

const Header = () => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}
    >
      <Image
        source={require("../../assets/images/avatar.png")}
        contentFit="cover"
        style={{ width: 32, height: 32, borderRadius: 16 }}
      />

      <Text
        selectable
        style={{
          // position: 'absolute',
          alignSelf: "center",
          color: "#1263df",
          fontSize: 17,
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
