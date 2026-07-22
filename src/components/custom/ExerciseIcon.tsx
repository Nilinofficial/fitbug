import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import { IconSet } from "@/constants/exercises";

type ExerciseIconProps = {
    iconSet: IconSet;
    icon: string;
    size: number;
    color: string;
};

const ExerciseIcon = ({ iconSet, icon, size, color }: ExerciseIconProps) => {
    if (iconSet === "material") {
        return (
            <MaterialCommunityIcons
                name={icon as ComponentProps<typeof MaterialCommunityIcons>["name"]}
                size={size}
                color={color}
            />
        );
    }
    return <Ionicons name={icon as ComponentProps<typeof Ionicons>["name"]} size={size} color={color} />;
};

export default ExerciseIcon;
