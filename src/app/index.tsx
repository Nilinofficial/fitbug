
import Header from "@/components/custom/Header";
import Streak from "@/components/custom/Streak";
import { ThemedView } from "@/components/themed-view";
import ScreenContent  from "@/components/wrappers/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";

export default function HomeScreen() {

  const colorScheme = useColorScheme();

  return (

      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ScreenContent>
          <Header />
          <Streak />
        </ScreenContent>

      </SafeAreaView>

  );
}
