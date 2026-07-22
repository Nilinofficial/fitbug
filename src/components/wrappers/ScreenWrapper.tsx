import { ReactNode } from "react";
import { ScrollView } from "react-native";

import { Spacing } from "@/constants/spacing";
import { BottomTabInset } from "@/constants/theme";

type ScreenContentProps = {
  children: ReactNode;
};

export default function ScreenContent({
  children,
}: ScreenContentProps) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: Spacing.screenHorizontal,
        paddingTop: Spacing.screenVertical,
        paddingBottom: BottomTabInset,
      }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}