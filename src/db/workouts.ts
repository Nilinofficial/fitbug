import { ASSUMED_SECONDS_PER_SET, estimateWorkoutCalories } from "@/algorithms/calorieAlgorithm";
import { db } from "@/db/client";
import { getProfile } from "@/db/profile";
import { WorkoutExercise } from "@/types/workout";

const deriveWorkoutTitle = (exerciseNames: string[]): string => {
    const unique = Array.from(new Set(exerciseNames.filter(Boolean)));
    if (unique.length === 0) return "Workout";
    if (unique.length === 1) return unique[0];
    return `${unique[0]} & ${unique[1]}`;
};

// Live-tracked exercises carry a real work/rest split; backfilled or
// pre-migration ones default both columns to 0, in which case we fall back
// to treating the old fixed per-set assumption as pure work time. This is
// the one place that decision is made — every calorie read path below (and
// getExerciseImprovements) goes through it.
const estimateExerciseCalories = (
    row: { totalReps: number; totalVolumeKg: number; totalSets: number; workSeconds: number; restSeconds: number },
    bodyWeightKg: number
): number => {
    const hasLiveTiming = row.workSeconds > 0 || row.restSeconds > 0;
    const workSeconds = hasLiveTiming ? row.workSeconds : row.totalSets * ASSUMED_SECONDS_PER_SET;
    const restSeconds = hasLiveTiming ? row.restSeconds : 0;
    return estimateWorkoutCalories({
        totalVolumeKg: row.totalVolumeKg,
        totalReps: row.totalReps,
        workSeconds,
        restSeconds,
        bodyWeightKg,
    });
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
    estimatedCalories: number;
};

export const getWorkoutHistory = (): WorkoutSummary[] => {
    const bodyWeightKg = getProfile()?.weight_kg ?? 0;

    const workouts = db.getAllSync<{
        id: number;
        started_at: string;
        finished_at: string;
        duration_seconds: number;
    }>("SELECT id, started_at, finished_at, duration_seconds FROM workouts ORDER BY started_at DESC");

    return workouts.map((workout) => {
        const exerciseRows = db.getAllSync<{
            id: number;
            name: string;
            bar_weight_kg: number;
            work_seconds: number;
            rest_seconds: number;
        }>(
            "SELECT id, name, bar_weight_kg, work_seconds, rest_seconds FROM workout_exercises WHERE workout_id = ?",
            [workout.id]
        );

        let totalSets = 0;
        let totalReps = 0;
        let totalVolumeKg = 0;
        let estimatedCalories = 0;

        for (const exercise of exerciseRows) {
            const sets = db.getAllSync<{ weight_kg: number; reps: number }>(
                "SELECT weight_kg, reps FROM workout_sets WHERE workout_exercise_id = ?",
                [exercise.id]
            );

            const exerciseReps = sets.reduce((sum, set) => sum + set.reps, 0);
            const exerciseVolumeKg = sets.reduce(
                (sum, set) => sum + (set.weight_kg + exercise.bar_weight_kg) * set.reps,
                0
            );

            totalSets += sets.length;
            totalReps += exerciseReps;
            totalVolumeKg += exerciseVolumeKg;
            estimatedCalories += estimateExerciseCalories(
                {
                    totalReps: exerciseReps,
                    totalVolumeKg: exerciseVolumeKg,
                    totalSets: sets.length,
                    workSeconds: exercise.work_seconds,
                    restSeconds: exercise.rest_seconds,
                },
                bodyWeightKg
            );
        }

        return {
            id: workout.id,
            title: deriveWorkoutTitle(exerciseRows.map((e) => e.name)),
            startedAt: workout.started_at,
            finishedAt: workout.finished_at,
            durationMinutes: Math.round(workout.duration_seconds / 60),
            totalSets,
            totalReps,
            totalVolumeKg,
            estimatedCalories: Math.round(estimatedCalories),
        };
    });
};

export type WorkoutDetailExercise = {
    id: number;
    name: string;
    equipment: string;
    muscle: string;
    barWeightKg: number;
    totalReps: number;
    totalVolumeKg: number;
    workSeconds: number;
    restSeconds: number;
    estimatedCalories: number;
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
    estimatedCalories: number;
    exercises: WorkoutDetailExercise[];
};

export const getWorkoutDetail = (id: number): WorkoutDetail | null => {
    const bodyWeightKg = getProfile()?.weight_kg ?? 0;

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
        bar_weight_kg: number;
        work_seconds: number;
        rest_seconds: number;
    }>(
        "SELECT id, name, equipment, muscle, bar_weight_kg, work_seconds, rest_seconds FROM workout_exercises WHERE workout_id = ? ORDER BY id ASC",
        [id]
    );

    const exercises: WorkoutDetailExercise[] = exerciseRows.map((exercise) => {
        const sets = db.getAllSync<{ set_index: number; weight_kg: number; reps: number }>(
            "SELECT set_index, weight_kg, reps FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_index ASC",
            [exercise.id]
        );

        const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
        // Volume (used for calorie/1RM math) stays bar-inclusive, but each set
        // row shows the raw plate weight the user actually typed in — the bar
        // is called out once per exercise instead of baked into every number.
        const totalVolumeKg = sets.reduce(
            (sum, set) => sum + (set.weight_kg + exercise.bar_weight_kg) * set.reps,
            0
        );

        return {
            id: exercise.id,
            name: exercise.name,
            equipment: exercise.equipment,
            muscle: exercise.muscle,
            barWeightKg: exercise.bar_weight_kg,
            totalReps,
            totalVolumeKg,
            workSeconds: exercise.work_seconds,
            restSeconds: exercise.rest_seconds,
            estimatedCalories: estimateExerciseCalories(
                {
                    totalReps,
                    totalVolumeKg,
                    totalSets: sets.length,
                    workSeconds: exercise.work_seconds,
                    restSeconds: exercise.rest_seconds,
                },
                bodyWeightKg
            ),
            sets: sets.map((set) => ({
                setIndex: set.set_index,
                weightKg: set.weight_kg,
                reps: set.reps,
            })),
        };
    });

    const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const totalReps = exercises.reduce((sum, exercise) => sum + exercise.totalReps, 0);
    const totalVolumeKg = exercises.reduce((sum, exercise) => sum + exercise.totalVolumeKg, 0);
    const estimatedCalories = exercises.reduce((sum, exercise) => sum + exercise.estimatedCalories, 0);

    return {
        id: workout.id,
        title: deriveWorkoutTitle(exercises.map((exercise) => exercise.name)),
        startedAt: workout.started_at,
        finishedAt: workout.finished_at,
        durationMinutes: Math.round(workout.duration_seconds / 60),
        totalSets,
        totalReps,
        totalVolumeKg,
        estimatedCalories,
        exercises,
    };
};

export type WorkoutCalorieSummary = {
    startedAt: string;
    estimatedCalories: number;
};

export const getWorkoutsSince = (sinceISO: string): WorkoutCalorieSummary[] => {
    const bodyWeightKg = getProfile()?.weight_kg ?? 0;

    const workouts = db.getAllSync<{
        id: number;
        started_at: string;
    }>("SELECT id, started_at FROM workouts WHERE started_at >= ?", [sinceISO]);

    return workouts.map((workout) => {
        const exerciseRows = db.getAllSync<{
            id: number;
            bar_weight_kg: number;
            work_seconds: number;
            rest_seconds: number;
        }>(
            "SELECT id, bar_weight_kg, work_seconds, rest_seconds FROM workout_exercises WHERE workout_id = ?",
            [workout.id]
        );

        let estimatedCalories = 0;
        for (const exercise of exerciseRows) {
            const sets = db.getAllSync<{ weight_kg: number; reps: number }>(
                "SELECT weight_kg, reps FROM workout_sets WHERE workout_exercise_id = ?",
                [exercise.id]
            );
            const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
            const totalVolumeKg = sets.reduce(
                (sum, set) => sum + (set.weight_kg + exercise.bar_weight_kg) * set.reps,
                0
            );
            estimatedCalories += estimateExerciseCalories(
                {
                    totalReps,
                    totalVolumeKg,
                    totalSets: sets.length,
                    workSeconds: exercise.work_seconds,
                    restSeconds: exercise.rest_seconds,
                },
                bodyWeightKg
            );
        }

        return {
            startedAt: workout.started_at,
            estimatedCalories: Math.round(estimatedCalories),
        };
    });
};

export type ExerciseImprovement = {
    workoutId: number;
    workoutExerciseId: number;
    name: string;
    equipment: string;
    muscle: string;
    finishedAt: string;
    estimatedCalories: number;
    previousCalories: number;
    totalVolumeKg: number;
    totalReps: number;
    topSetWeightKg: number;
    topSetReps: number;
};

/**
 * An "improvement" is a logged exercise instance that burned more estimated
 * calories than the previous time that same exercise was logged (weight/reps
 * went up enough to raise the estimate) — not simply the heaviest weight ever
 * lifted, which unfairly favors big compound lifts over lighter accessory work.
 */
export const getExerciseImprovements = (limit = 10): ExerciseImprovement[] => {
    const bodyWeightKg = getProfile()?.weight_kg ?? 0;
    if (bodyWeightKg <= 0) return [];

    const instances = db.getAllSync<{
        workout_exercise_id: number;
        workout_id: number;
        name: string;
        equipment: string;
        muscle: string;
        bar_weight_kg: number;
        work_seconds: number;
        rest_seconds: number;
        finished_at: string;
    }>(
        `SELECT
           we.id AS workout_exercise_id,
           we.workout_id AS workout_id,
           we.name AS name,
           we.equipment AS equipment,
           we.muscle AS muscle,
           we.bar_weight_kg AS bar_weight_kg,
           we.work_seconds AS work_seconds,
           we.rest_seconds AS rest_seconds,
           w.finished_at AS finished_at
         FROM workout_exercises we
         JOIN workouts w ON w.id = we.workout_id
         ORDER BY we.name ASC, w.started_at ASC`
    );

    const improvements: ExerciseImprovement[] = [];
    const previousCaloriesByName = new Map<string, number>();

    for (const instance of instances) {
        const sets = db.getAllSync<{ weight_kg: number; reps: number }>(
            "SELECT weight_kg, reps FROM workout_sets WHERE workout_exercise_id = ?",
            [instance.workout_exercise_id]
        );
        if (sets.length === 0) continue;

        const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
        const totalVolumeKg = sets.reduce(
            (sum, set) => sum + (set.weight_kg + instance.bar_weight_kg) * set.reps,
            0
        );

        const estimatedCalories = estimateExerciseCalories(
            {
                totalReps,
                totalVolumeKg,
                totalSets: sets.length,
                workSeconds: instance.work_seconds,
                restSeconds: instance.rest_seconds,
            },
            bodyWeightKg
        );

        const previousCalories = previousCaloriesByName.get(instance.name);
        if (previousCalories !== undefined && estimatedCalories > previousCalories) {
            const topSet = sets.reduce(
                (best, set) => {
                    const weightKg = set.weight_kg + instance.bar_weight_kg;
                    return weightKg > best.weightKg ? { weightKg, reps: set.reps } : best;
                },
                { weightKg: 0, reps: 0 }
            );

            improvements.push({
                workoutId: instance.workout_id,
                workoutExerciseId: instance.workout_exercise_id,
                name: instance.name,
                equipment: instance.equipment,
                muscle: instance.muscle,
                finishedAt: instance.finished_at,
                estimatedCalories,
                previousCalories,
                totalVolumeKg,
                totalReps,
                topSetWeightKg: topSet.weightKg,
                topSetReps: topSet.reps,
            });
        }

        previousCaloriesByName.set(instance.name, estimatedCalories);
    }

    return improvements
        .sort((a, b) => new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime())
        .slice(0, limit);
};

type SaveWorkoutInput = {
    // The moment the workout is being logged as complete — "now" for a live
    // entry, or a chosen time-of-day on a past date for a backfilled one.
    finishedAt: number;
    exercises: WorkoutExercise[];
};

export const saveWorkout = ({ finishedAt, exercises }: SaveWorkoutInput) => {
    const validExercises = exercises
        .map((exercise) => ({
            ...exercise,
            // A set with 0 reps was never actually performed, regardless of what
            // weight was dialed in.
            sets: exercise.sets.filter((set) => set.reps > 0),
        }))
        .filter((exercise) => exercise.sets.length > 0);

    if (validExercises.length === 0) return;

    // Duration prefers real work/rest timing from the live toggle when any was
    // recorded; backfilled entries (no live session, workSeconds/restSeconds
    // both 0) fall back to the old fixed per-set assumption.
    const totalWorkSeconds = validExercises.reduce((sum, exercise) => sum + exercise.workSeconds, 0);
    const totalRestSeconds = validExercises.reduce((sum, exercise) => sum + exercise.restSeconds, 0);
    const hasLiveTiming = totalWorkSeconds > 0 || totalRestSeconds > 0;
    const totalSets = validExercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
    const durationSeconds = hasLiveTiming ? totalWorkSeconds + totalRestSeconds : totalSets * ASSUMED_SECONDS_PER_SET;
    const startedAt = finishedAt - durationSeconds * 1000;

    db.withTransactionSync(() => {
        db.runSync(
            "INSERT INTO workouts (started_at, finished_at, duration_seconds) VALUES (?, ?, ?)",
            [new Date(startedAt).toISOString(), new Date(finishedAt).toISOString(), durationSeconds]
        );
        const workoutId = db.getFirstSync<{ id: number }>("SELECT last_insert_rowid() as id")!.id;

        for (const exercise of validExercises) {
            db.runSync(
                "INSERT INTO workout_exercises (workout_id, template_id, name, equipment, muscle, bar_weight_kg, work_seconds, rest_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    workoutId,
                    exercise.templateId,
                    exercise.name,
                    exercise.equipment,
                    exercise.muscle,
                    exercise.barWeightKg,
                    Math.max(0, Math.round(exercise.workSeconds)),
                    Math.max(0, Math.round(exercise.restSeconds)),
                ]
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
