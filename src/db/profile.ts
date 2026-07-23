import { db } from "@/db/client";

export type Gender = "male" | "female";
export type Goal = "fat_loss" | "muscle_gain" | "recomp" | "maintain";

export type Profile = {
    id: number;
    name: string;
    age: number;
    weight_kg: number;
    height_cm: number;
    reminder_time: string;
    reminders_enabled: number;
    theme: string;
    gender: Gender;
    target_weight_kg: number | null;
    goal: Goal | null;
    created_at: string;
};

export const getProfile = (): Profile | null => {
    return db.getFirstSync<Profile>("SELECT * FROM profile WHERE id = 1") ?? null;
};

export const saveProfile = (input: {
    name: string;
    age: number;
    weightKg: number;
    heightCm: number;
    reminderTime: string;
    remindersEnabled: boolean;
    theme: string;
    gender: Gender;
    targetWeightKg?: number | null;
    goal?: Goal | null;
}) => {
    db.runSync(
        `INSERT INTO profile (id, name, age, weight_kg, height_cm, reminder_time, reminders_enabled, theme, gender, target_weight_kg, goal, created_at)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           age=excluded.age,
           weight_kg=excluded.weight_kg,
           height_cm=excluded.height_cm,
           reminder_time=excluded.reminder_time,
           reminders_enabled=excluded.reminders_enabled,
           theme=excluded.theme,
           gender=excluded.gender,
           target_weight_kg=excluded.target_weight_kg,
           goal=excluded.goal`,
        [
            input.name,
            input.age,
            input.weightKg,
            input.heightCm,
            input.reminderTime,
            input.remindersEnabled ? 1 : 0,
            input.theme,
            input.gender,
            input.targetWeightKg ?? null,
            input.goal ?? null,
            new Date().toISOString(),
        ]
    );
};

export const setProfileTheme = (theme: string) => {
    db.runSync("UPDATE profile SET theme = ? WHERE id = 1", [theme]);
};

export const setGoal = (targetWeightKg: number, goal: Goal) => {
    db.runSync("UPDATE profile SET target_weight_kg = ?, goal = ? WHERE id = 1", [targetWeightKg, goal]);
};
