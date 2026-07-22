import { db } from "@/db/client";

export type DraftCustomWorkoutExercise = {
    templateId: string;
    name: string;
    equipment: string;
    muscle: string;
    targetSets: number;
    targetRepsMin: number;
    targetRepsMax: number;
};

type SaveCustomWorkoutInput = {
    name: string;
    icon: string;
    muscleGroups: string[];
    exercises: DraftCustomWorkoutExercise[];
};

export const saveCustomWorkout = ({ name, icon, muscleGroups, exercises }: SaveCustomWorkoutInput) => {
    db.withTransactionSync(() => {
        db.runSync(
            "INSERT INTO custom_workouts (name, icon, muscle_groups, created_at) VALUES (?, ?, ?, ?)",
            [name, icon, muscleGroups.join(","), new Date().toISOString()]
        );
        const workoutId = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id")!.id;

        exercises.forEach((exercise, index) => {
            db.runSync(
                `INSERT INTO custom_workout_exercises
                   (custom_workout_id, template_id, name, equipment, muscle, target_sets, target_reps_min, target_reps_max, position)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    workoutId,
                    exercise.templateId,
                    exercise.name,
                    exercise.equipment,
                    exercise.muscle,
                    exercise.targetSets,
                    exercise.targetRepsMin,
                    exercise.targetRepsMax,
                    index,
                ]
            );
        });
    });
};

export type CustomWorkoutSummary = {
    id: number;
    name: string;
    icon: string;
    muscleGroups: string[];
    exerciseCount: number;
};

export const getCustomWorkouts = (): CustomWorkoutSummary[] => {
    const rows = db.getAllSync<{ id: number; name: string; icon: string; muscle_groups: string }>(
        "SELECT id, name, icon, muscle_groups FROM custom_workouts ORDER BY id DESC"
    );

    return rows.map((row) => {
        const count = db.getFirstSync<{ count: number }>(
            "SELECT COUNT(*) AS count FROM custom_workout_exercises WHERE custom_workout_id = ?",
            [row.id]
        );
        return {
            id: row.id,
            name: row.name,
            icon: row.icon,
            muscleGroups: row.muscle_groups ? row.muscle_groups.split(",").filter(Boolean) : [],
            exerciseCount: count?.count ?? 0,
        };
    });
};

export const getCustomWorkoutExercises = (id: number): { templateId: string }[] => {
    return db.getAllSync<{ templateId: string }>(
        "SELECT template_id AS templateId FROM custom_workout_exercises WHERE custom_workout_id = ? ORDER BY position ASC",
        [id]
    );
};
