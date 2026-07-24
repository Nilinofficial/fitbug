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
    hasBarWeight: boolean;
    barWeightKg: number;
    workSeconds: number;
    restSeconds: number;
    sets: SetEntry[];
};
