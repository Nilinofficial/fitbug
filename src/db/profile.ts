import { db } from "@/db/client";

export type Profile = {
    id: number;
    name: string;
    age: number;
    weight_kg: number;
    height_cm: number;
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
}) => {
    db.runSync(
        `INSERT INTO profile (id, name, age, weight_kg, height_cm, created_at)
         VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           age=excluded.age,
           weight_kg=excluded.weight_kg,
           height_cm=excluded.height_cm`,
        [input.name, input.age, input.weightKg, input.heightCm, new Date().toISOString()]
    );
};
