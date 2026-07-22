export type IconSet = "ionicons" | "material";

export type ExerciseTemplate = {
    id: string;
    name: string;
    equipment: string;
    muscle: string;
    iconSet: IconSet;
    icon: string;
    iconBg: string;
    iconColor: string;
};

export const EXERCISE_LIBRARY: ExerciseTemplate[] = [
    {
        id: "bench-press",
        name: "Bench Press",
        equipment: "Barbell",
        muscle: "Chest, Triceps",
        iconSet: "ionicons",
        icon: "barbell",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "deadlift",
        name: "Deadlift",
        equipment: "Barbell",
        muscle: "Hamstrings, Lower Back",
        iconSet: "material",
        icon: "weight-lifter",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "pec-deck-fly",
        name: "Pec Deck Fly",
        equipment: "Machine",
        muscle: "Chest",
        iconSet: "material",
        icon: "arm-flex-outline",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "lat-pulldown",
        name: "Lat Pulldown",
        equipment: "Cable",
        muscle: "Back",
        iconSet: "material",
        icon: "arm-flex",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "leg-press",
        name: "Leg Press",
        equipment: "Machine",
        muscle: "Quadriceps, Glutes",
        iconSet: "material",
        icon: "weight-lifter",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "leg-extension",
        name: "Leg Extension",
        equipment: "Machine",
        muscle: "Quadriceps",
        iconSet: "material",
        icon: "run",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "leg-curl",
        name: "Leg Curl",
        equipment: "Machine",
        muscle: "Hamstrings",
        iconSet: "material",
        icon: "walk",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "calf-raises",
        name: "Calf Raises",
        equipment: "Machine",
        muscle: "Calves",
        iconSet: "material",
        icon: "shoe-print",
        iconBg: "#EAF1FE",
        iconColor: "#1263df",
    },
    {
        id: "incline-chest-press",
        name: "Incline Chest Press",
        equipment: "Barbell",
        muscle: "Upper Chest, Triceps",
        iconSet: "material",
        icon: "trending-up",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
    {
        id: "decline-chest-press",
        name: "Decline Chest Press",
        equipment: "Barbell",
        muscle: "Lower Chest, Triceps",
        iconSet: "material",
        icon: "trending-down",
        iconBg: "#FFF1E6",
        iconColor: "#e2703a",
    },
];
