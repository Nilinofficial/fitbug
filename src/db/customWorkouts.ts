import { db } from "@/db/client";

export type CustomWorkoutSummary = {
    id: number;
    name: string;
    icon: string;
    muscleGroups: string[];
};

type SaveCustomWorkoutInput = {
    name: string;
    icon: string;
    muscleGroups: string[];
};

export const saveCustomWorkout = ({ name, icon, muscleGroups }: SaveCustomWorkoutInput) => {
    db.runSync(
        "INSERT INTO custom_workouts (name, icon, muscle_groups, created_at) VALUES (?, ?, ?, ?)",
        [name, icon, muscleGroups.join(","), new Date().toISOString()]
    );
};

export const deleteCustomWorkout = (id: number) => {
    db.runSync("DELETE FROM custom_workouts WHERE id = ?", [id]);
};

const toSummary = (row: { id: number; name: string; icon: string; muscle_groups: string }): CustomWorkoutSummary => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    muscleGroups: row.muscle_groups ? row.muscle_groups.split(",").filter(Boolean) : [],
});

export const getCustomWorkouts = (): CustomWorkoutSummary[] => {
    const rows = db.getAllSync<{ id: number; name: string; icon: string; muscle_groups: string }>(
        "SELECT id, name, icon, muscle_groups FROM custom_workouts ORDER BY id DESC"
    );
    return rows.map(toSummary);
};

export const getCustomWorkoutById = (id: number): CustomWorkoutSummary | null => {
    const row = db.getFirstSync<{ id: number; name: string; icon: string; muscle_groups: string }>(
        "SELECT id, name, icon, muscle_groups FROM custom_workouts WHERE id = ?",
        [id]
    );
    return row ? toSummary(row) : null;
};
