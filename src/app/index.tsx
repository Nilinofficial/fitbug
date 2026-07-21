
import Header from "@/components/custom/Header";
import Streak from "@/components/custom/Streak";
import { ThemedView } from "@/components/themed-view";
import ScreenContent  from "@/components/wrappers/ScreenWrapper";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenContent>
          <Header />
          <Streak />
        </ScreenContent>

      </SafeAreaView>
    </ThemedView>
  );
}
