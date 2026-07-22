import { db } from "@/db/client";

export const getLoggedExerciseNames = (): string[] => {
    const rows = db.getAllSync<{ name: string }>(
        "SELECT DISTINCT name FROM workout_exercises ORDER BY name ASC"
    );
    return rows.map((row) => row.name);
};

export type ExerciseSetRow = {
    date: string;
    weightKg: number;
    reps: number;
};

export const getExerciseSetHistory = (name: string): ExerciseSetRow[] => {
    const rows = db.getAllSync<{ started_at: string; weight_kg: number; reps: number }>(
        `SELECT w.started_at AS started_at, ws.weight_kg AS weight_kg, ws.reps AS reps
         FROM workout_sets ws
         JOIN workout_exercises we ON we.id = ws.workout_exercise_id
         JOIN workouts w ON w.id = we.workout_id
         WHERE we.name = ?
         ORDER BY w.started_at ASC`,
        [name]
    );
    return rows.map((row) => ({ date: row.started_at, weightKg: row.weight_kg, reps: row.reps }));
};

export type WeeklyFrequencyBucket = {
    label: string;
    count: number;
};

const MS_PER_DAY = 86400000;

const startOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
};

export const getWeeklyWorkoutFrequency = (weeks = 4): WeeklyFrequencyBucket[] => {
    const rows = db.getAllSync<{ started_at: string }>("SELECT started_at FROM workouts");
    const currentWeekStart = startOfWeek(new Date());

    const buckets: WeeklyFrequencyBucket[] = [];
    for (let i = weeks - 1; i >= 0; i--) {
        const start = new Date(currentWeekStart.getTime() - i * 7 * MS_PER_DAY);
        const end = new Date(start.getTime() + 7 * MS_PER_DAY);
        const count = rows.filter((row) => {
            const time = new Date(row.started_at).getTime();
            return time >= start.getTime() && time < end.getTime();
        }).length;
        buckets.push({ label: `W${weeks - i}`, count });
    }
    return buckets;
};
