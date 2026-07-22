import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

export type ExerciseTemplate = {
    id: string;
    name: string;
    equipment: string;
    muscle: string;
    icon: ComponentProps<typeof Ionicons>["name"];
    iconBg: string;
    iconColor: string;
};

export const EXERCISE_LIBRARY: ExerciseTemplate[] = [
    {
        id: "bench-press",
        name: "Bench Press",
        equipment: "Barbell",
        muscle: "Chest, Triceps",
        icon: "barbell",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "back-squat",
        name: "Back Squat",
        equipment: "Barbell",
        muscle: "Quads, Glutes",
        icon: "ellipse-outline",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "deadlift",
        name: "Deadlift",
        equipment: "Barbell",
        muscle: "Hamstrings, Lower Back",
        icon: "hand-left-outline",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "overhead-press",
        name: "Overhead Press",
        equipment: "Dumbbell",
        muscle: "Shoulders, Triceps",
        icon: "walk-outline",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "pull-up",
        name: "Pull Up",
        equipment: "Bodyweight",
        muscle: "Back, Biceps",
        icon: "arrow-up-outline",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "bicep-curl",
        name: "Bicep Curl",
        equipment: "Dumbbell",
        muscle: "Biceps",
        icon: "fitness-outline",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "plank",
        name: "Plank",
        equipment: "Bodyweight",
        muscle: "Core",
        icon: "remove-outline",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "lat-pulldown",
        name: "Lat Pulldown",
        equipment: "Cable",
        muscle: "Back",
        icon: "arrow-down-outline",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
];
