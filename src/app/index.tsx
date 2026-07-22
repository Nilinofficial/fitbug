
import BottomNav from "@/components/custom/BottomNav";
import Header from "@/components/custom/Header";
import PersonalRecords from "@/components/custom/PersonalRecords";
import RecentActivities from "@/components/custom/RecentActivities";
import Streak from "@/components/custom/Streak";
import WorkoutCard from "@/components/custom/WorkoutCard";
import ScreenContent  from "@/components/wrappers/ScreenWrapper";
import { getProfile } from "@/db/profile";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme, View } from "react-native";

export default function HomeScreen() {

  const colorScheme = useColorScheme();
  const [profile] = useState(() => getProfile());

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  return (

      <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F6FA" }}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <ScreenContent>
          <Header />
          <Streak name={profile.name} />
          <WorkoutCard />
          <View style={{ height: 24 }} />
          <PersonalRecords />
          <View style={{ height: 24 }} />
          <RecentActivities />
        </ScreenContent>
        <BottomNav />
      </SafeAreaView>

  );
}
