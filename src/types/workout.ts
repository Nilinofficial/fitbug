export type SetEntry = {
    id: string;
    weight: number;
    reps: number;
};

export type WorkoutExercise = {
    instanceId: string;
    templateId: string;
    name: string;
    equipment: string;
    muscle: string;
    sets: SetEntry[];
};
