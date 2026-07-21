import { ReactNode } from "react";
import { View } from "react-native";

import { Spacing } from "@/constants/spacing";

type ScreenContentProps = {
  children: ReactNode;
};

export default function ScreenContent({
  children,
}: ScreenContentProps) {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical:Spacing.screenVertical
      }}
    >
      {children}
    </View>
  );
}