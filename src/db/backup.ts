import { db } from "@/db/client";
import { getProfile, Profile } from "@/db/profile";

export type BackupData = {
    version: 1;
    exportedAt: string;
    profile: Profile | null;
    workouts: {
        startedAt: string;
        finishedAt: string;
        durationSeconds: number;
        exercises: {
            templateId: string;
            name: string;
            equipment: string;
            muscle: string;
            sets: { setIndex: number; weightKg: number; reps: number }[];
        }[];
    }[];
    customWorkouts: { name: string; icon: string; muscleGroups: string[] }[];
};

export const exportAllData = (): BackupData => {
    const profile = getProfile();

    const workoutRows = db.getAllSync<{
        id: number;
        started_at: string;
        finished_at: string;
        duration_seconds: number;
    }>("SELECT id, started_at, finished_at, duration_seconds FROM workouts ORDER BY id ASC");

    const workouts = workoutRows.map((workout) => {
        const exerciseRows = db.getAllSync<{
            id: number;
            template_id: string;
            name: string;
            equipment: string;
            muscle: string;
        }>(
            "SELECT id, template_id, name, equipment, muscle FROM workout_exercises WHERE workout_id = ? ORDER BY id ASC",
            [workout.id]
        );

        const exercises = exerciseRows.map((exercise) => {
            const sets = db.getAllSync<{ set_index: number; weight_kg: number; reps: number }>(
                "SELECT set_index, weight_kg, reps FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_index ASC",
                [exercise.id]
            );
            return {
                templateId: exercise.template_id,
                name: exercise.name,
                equipment: exercise.equipment,
                muscle: exercise.muscle,
                sets: sets.map((set) => ({
                    setIndex: set.set_index,
                    weightKg: set.weight_kg,
                    reps: set.reps,
                })),
            };
        });

        return {
            startedAt: workout.started_at,
            finishedAt: workout.finished_at,
            durationSeconds: workout.duration_seconds,
            exercises,
        };
    });

    const customWorkoutRows = db.getAllSync<{ name: string; icon: string; muscle_groups: string }>(
        "SELECT name, icon, muscle_groups FROM custom_workouts ORDER BY id ASC"
    );
    const customWorkouts = customWorkoutRows.map((row) => ({
        name: row.name,
        icon: row.icon,
        muscleGroups: row.muscle_groups ? row.muscle_groups.split(",").filter(Boolean) : [],
    }));

    return {
        version: 1,
        exportedAt: new Date().toISOString(),
        profile,
        workouts,
        customWorkouts,
    };
};

export const importAllData = (data: BackupData): void => {
    db.withTransactionSync(() => {
        db.execSync("DELETE FROM workout_sets;");
        db.execSync("DELETE FROM workout_exercises;");
        db.execSync("DELETE FROM workouts;");
        db.execSync("DELETE FROM custom_workouts;");
        db.execSync("DELETE FROM profile;");

        if (data.profile) {
            db.runSync(
                `INSERT INTO profile (id, name, age, weight_kg, height_cm, reminder_time, reminders_enabled, theme, gender, profile_picture, created_at)
                 VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.profile.name,
                    data.profile.age,
                    data.profile.weight_kg,
                    data.profile.height_cm,
                    data.profile.reminder_time,
                    data.profile.reminders_enabled,
                    data.profile.theme,
                    data.profile.gender,
                    data.profile.profile_picture,
                    data.profile.created_at,
                ]
            );
        }

        for (const workout of data.workouts) {
            db.runSync(
                "INSERT INTO workouts (started_at, finished_at, duration_seconds) VALUES (?, ?, ?)",
                [workout.startedAt, workout.finishedAt, workout.durationSeconds]
            );
            const workoutId = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id")!.id;

            for (const exercise of workout.exercises) {
                db.runSync(
                    "INSERT INTO workout_exercises (workout_id, template_id, name, equipment, muscle) VALUES (?, ?, ?, ?, ?)",
                    [workoutId, exercise.templateId, exercise.name, exercise.equipment, exercise.muscle]
                );
                const exerciseId = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id")!.id;

                for (const set of exercise.sets) {
                    db.runSync(
                        "INSERT INTO workout_sets (workout_exercise_id, set_index, weight_kg, reps) VALUES (?, ?, ?, ?)",
                        [exerciseId, set.setIndex, set.weightKg, set.reps]
                    );
                }
            }
        }

        for (const customWorkout of data.customWorkouts) {
            db.runSync(
                "INSERT INTO custom_workouts (name, icon, muscle_groups, created_at) VALUES (?, ?, ?, ?)",
                [customWorkout.name, customWorkout.icon, customWorkout.muscleGroups.join(","), new Date().toISOString()]
            );
        }
    });
};
