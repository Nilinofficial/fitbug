import { db } from "@/db/client";
import { WorkoutExercise } from "@/types/workout";

const deriveWorkoutTitle = (exerciseNames: string[]): string => {
    const unique = Array.from(new Set(exerciseNames.filter(Boolean)));
    if (unique.length === 0) return "Workout";
    if (unique.length === 1) return unique[0];
    return `${unique[0]} & ${unique[1]}`;
};

export type WorkoutSummary = {
    id: number;
    title: string;
    startedAt: string;
    finishedAt: string;
    durationMinutes: number;
    totalSets: number;
    totalReps: number;
    totalVolumeKg: number;
};

export const getWorkoutHistory = (): WorkoutSummary[] => {
    const workouts = db.getAllSync<{
        id: number;
        started_at: string;
        finished_at: string;
        duration_seconds: number;
    }>("SELECT id, started_at, finished_at, duration_seconds FROM workouts ORDER BY started_at DESC");

    return workouts.map((workout) => {
        const exerciseNames = db.getAllSync<{ name: string }>(
            "SELECT name FROM workout_exercises WHERE workout_id = ?",
            [workout.id]
        );
        const totals = db.getFirstSync<{
            totalSets: number;
            totalReps: number | null;
            totalVolumeKg: number | null;
        }>(
            `SELECT COUNT(*) AS totalSets, SUM(ws.reps) AS totalReps, SUM(ws.weight_kg * ws.reps) AS totalVolumeKg
             FROM workout_sets ws
             JOIN workout_exercises we ON we.id = ws.workout_exercise_id
             WHERE we.workout_id = ?`,
            [workout.id]
        );

        return {
            id: workout.id,
            title: deriveWorkoutTitle(exerciseNames.map((e) => e.name)),
            startedAt: workout.started_at,
            finishedAt: workout.finished_at,
            durationMinutes: Math.round(workout.duration_seconds / 60),
            totalSets: totals?.totalSets ?? 0,
            totalReps: totals?.totalReps ?? 0,
            totalVolumeKg: totals?.totalVolumeKg ?? 0,
        };
    });
};

export type WorkoutDetailExercise = {
    id: number;
    name: string;
    equipment: string;
    muscle: string;
    totalVolumeKg: number;
    sets: { setIndex: number; weightKg: number; reps: number }[];
};

export type WorkoutDetail = {
    id: number;
    title: string;
    startedAt: string;
    finishedAt: string;
    durationMinutes: number;
    totalSets: number;
    totalReps: number;
    totalVolumeKg: number;
    exercises: WorkoutDetailExercise[];
};

export const getWorkoutDetail = (id: number): WorkoutDetail | null => {
    const workout = db.getFirstSync<{
        id: number;
        started_at: string;
        finished_at: string;
        duration_seconds: number;
    }>("SELECT id, started_at, finished_at, duration_seconds FROM workouts WHERE id = ?", [id]);

    if (!workout) return null;

    const exerciseRows = db.getAllSync<{
        id: number;
        name: string;
        equipment: string;
        muscle: string;
    }>(
        "SELECT id, name, equipment, muscle FROM workout_exercises WHERE workout_id = ? ORDER BY id ASC",
        [id]
    );

    const exercises: WorkoutDetailExercise[] = exerciseRows.map((exercise) => {
        const sets = db.getAllSync<{ set_index: number; weight_kg: number; reps: number }>(
            "SELECT set_index, weight_kg, reps FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_index ASC",
            [exercise.id]
        );

        return {
            id: exercise.id,
            name: exercise.name,
            equipment: exercise.equipment,
            muscle: exercise.muscle,
            totalVolumeKg: sets.reduce((sum, set) => sum + set.weight_kg * set.reps, 0),
            sets: sets.map((set) => ({
                setIndex: set.set_index,
                weightKg: set.weight_kg,
                reps: set.reps,
            })),
        };
    });

    const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const totalReps = exercises.reduce(
        (sum, exercise) => sum + exercise.sets.reduce((setSum, set) => setSum + set.reps, 0),
        0
    );
    const totalVolumeKg = exercises.reduce((sum, exercise) => sum + exercise.totalVolumeKg, 0);

    return {
        id: workout.id,
        title: deriveWorkoutTitle(exercises.map((exercise) => exercise.name)),
        startedAt: workout.started_at,
        finishedAt: workout.finished_at,
        durationMinutes: Math.round(workout.duration_seconds / 60),
        totalSets,
        totalReps,
        totalVolumeKg,
        exercises,
    };
};

export type WorkoutCalorieInput = {
    startedAt: string;
    durationMinutes: number;
    totalVolumeKg: number;
    totalReps: number;
};

export const getWorkoutsSince = (sinceISO: string): WorkoutCalorieInput[] => {
    const workouts = db.getAllSync<{
        id: number;
        started_at: string;
        duration_seconds: number;
    }>("SELECT id, started_at, duration_seconds FROM workouts WHERE started_at >= ?", [sinceISO]);

    return workouts.map((workout) => {
        const totals = db.getFirstSync<{
            totalReps: number | null;
            totalVolumeKg: number | null;
        }>(
            `SELECT SUM(ws.reps) AS totalReps, SUM(ws.weight_kg * ws.reps) AS totalVolumeKg
             FROM workout_sets ws
             JOIN workout_exercises we ON we.id = ws.workout_exercise_id
             WHERE we.workout_id = ?`,
            [workout.id]
        );

        return {
            startedAt: workout.started_at,
            durationMinutes: Math.round(workout.duration_seconds / 60),
            totalVolumeKg: totals?.totalVolumeKg ?? 0,
            totalReps: totals?.totalReps ?? 0,
        };
    });
};

export type PersonalRecordRow = {
    name: string;
    equipment: string;
    muscle: string;
    weight_kg: number;
    reps: number;
    finished_at: string;
};

export const getTopPersonalRecords = (limit = 2): PersonalRecordRow[] => {
    return db.getAllSync<PersonalRecordRow>(
        `WITH ranked AS (
           SELECT
             we.name AS name,
             we.equipment AS equipment,
             we.muscle AS muscle,
             ws.weight_kg AS weight_kg,
             ws.reps AS reps,
             w.finished_at AS finished_at,
             ROW_NUMBER() OVER (
               PARTITION BY we.name
               ORDER BY ws.weight_kg DESC, ws.reps DESC
             ) AS rn
           FROM workout_sets ws
           JOIN workout_exercises we ON we.id = ws.workout_exercise_id
           JOIN workouts w ON w.id = we.workout_id
         )
         SELECT name, equipment, muscle, weight_kg, reps, finished_at
         FROM ranked
         WHERE rn = 1
         ORDER BY weight_kg DESC
         LIMIT ?;`,
        [limit]
    );
};

type SaveWorkoutInput = {
    startedAt: number;
    finishedAt: number;
    exercises: WorkoutExercise[];
};

export const saveWorkout = ({ startedAt, finishedAt, exercises }: SaveWorkoutInput) => {
    const validExercises = exercises
        .map((exercise) => ({
            ...exercise,
            sets: exercise.sets.filter((set) => !(set.weight === 0 && set.reps === 0)),
        }))
        .filter((exercise) => exercise.sets.length > 0);

    if (validExercises.length === 0) return;

    db.withTransactionSync(() => {
        const durationSeconds = Math.floor((finishedAt - startedAt) / 1000);
        db.runSync(
            "INSERT INTO workouts (started_at, finished_at, duration_seconds) VALUES (?, ?, ?)",
            [new Date(startedAt).toISOString(), new Date(finishedAt).toISOString(), durationSeconds]
        );
        const workoutId = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id")!.id;

        for (const exercise of validExercises) {
            db.runSync(
                "INSERT INTO workout_exercises (workout_id, template_id, name, equipment, muscle) VALUES (?, ?, ?, ?, ?)",
                [workoutId, exercise.templateId, exercise.name, exercise.equipment, exercise.muscle]
            );
            const exerciseId = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id")!.id;

            exercise.sets.forEach((set, index) => {
                db.runSync(
                    "INSERT INTO workout_sets (workout_exercise_id, set_index, weight_kg, reps) VALUES (?, ?, ?, ?)",
                    [exerciseId, index, set.weight, set.reps]
                );
            });
        }
    });
};

export const deleteWorkout = (id: number) => {
    db.withTransactionSync(() => {
        db.runSync(
            `DELETE FROM workout_sets
             WHERE workout_exercise_id IN (
               SELECT id FROM workout_exercises WHERE workout_id = ?
             )`,
            [id]
        );
        db.runSync("DELETE FROM workout_exercises WHERE workout_id = ?", [id]);
        db.runSync("DELETE FROM workouts WHERE id = ?", [id]);
    });
};
