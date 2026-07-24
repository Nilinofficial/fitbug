import { db } from "@/db/client";

export type CustomWorkoutSummary = {
    id: number;
    name: string;
    icon: string;
    muscleGroups: string[];
    hasBarWeight: boolean;
    barWeightKg: number;
};

type SaveCustomWorkoutInput = {
    name: string;
    icon: string;
    muscleGroups: string[];
    hasBarWeight: boolean;
    barWeightKg: number;
};

export const saveCustomWorkout = ({ name, icon, muscleGroups, hasBarWeight, barWeightKg }: SaveCustomWorkoutInput) => {
    db.runSync(
        "INSERT INTO custom_workouts (name, icon, muscle_groups, has_bar_weight, bar_weight_kg, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [name, icon, muscleGroups.join(","), hasBarWeight ? 1 : 0, barWeightKg, new Date().toISOString()]
    );
};

export const deleteCustomWorkout = (id: number) => {
    db.runSync("DELETE FROM custom_workouts WHERE id = ?", [id]);
};

type CustomWorkoutRow = {
    id: number;
    name: string;
    icon: string;
    muscle_groups: string;
    has_bar_weight: number;
    bar_weight_kg: number;
};

const toSummary = (row: CustomWorkoutRow): CustomWorkoutSummary => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    muscleGroups: row.muscle_groups ? row.muscle_groups.split(",").filter(Boolean) : [],
    hasBarWeight: Boolean(row.has_bar_weight),
    barWeightKg: row.bar_weight_kg,
});

const SELECT_COLUMNS = "id, name, icon, muscle_groups, has_bar_weight, bar_weight_kg";

export const getCustomWorkouts = (): CustomWorkoutSummary[] => {
    const rows = db.getAllSync<CustomWorkoutRow>(
        `SELECT ${SELECT_COLUMNS} FROM custom_workouts ORDER BY id DESC`
    );
    return rows.map(toSummary);
};

export const getCustomWorkoutById = (id: number): CustomWorkoutSummary | null => {
    const row = db.getFirstSync<CustomWorkoutRow>(
        `SELECT ${SELECT_COLUMNS} FROM custom_workouts WHERE id = ?`,
        [id]
    );
    return row ? toSummary(row) : null;
};
