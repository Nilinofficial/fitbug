import { Text, View } from "react-native";

import Header from "@/components/Header";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView>
        <Header />

        <View
          style={{
            borderLeftWidth: 3,
            borderLeftColor: "#7558f6",
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 16,
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
                style={{ color: "#20242d", fontSize: 23, fontWeight: "800", letterSpacing: -0.7 }}
              >
                Hi, Alex
              </Text>
              <Text selectable style={{ color: "#9599a5", fontSize: 12, fontWeight: "600" }}>
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
                12 Days
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
