
import BottomNav from "@/components/custom/BottomNav";
import Header from "@/components/custom/Header";
import PersonalRecords from "@/components/custom/PersonalRecords";
import RecentActivities from "@/components/custom/RecentActivities";
import Streak from "@/components/custom/Streak";
import WorkoutCard from "@/components/custom/WorkoutCard";
import ScreenContent  from "@/components/wrappers/ScreenWrapper";
import { getWorkoutDaysThisMonth } from "@/db/activity";
import { getProfile } from "@/db/profile";
import { useFocusRefresh } from "@/hooks/use-focus-refresh";
import { useAppTheme } from "@/theme/ThemeProvider";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export default function HomeScreen() {

  const { scheme, colors } = useAppTheme();
  const [profile] = useState(() => getProfile());
  const [daysThisMonth, setDaysThisMonth] = useState(() => getWorkoutDaysThisMonth());

  useFocusRefresh(() => setDaysThisMonth(getWorkoutDaysThisMonth()));

  if (!profile) {
    return <Redirect href="/onboarding" />;
  }

  return (

      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        <ScreenContent>
          <Header />
          <Streak name={profile.name} daysThisMonth={daysThisMonth} />
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
