import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("fitbug.db");

// The profile table's shape changed a few times during development (e.g. date_of_birth -> age).
// CREATE TABLE IF NOT EXISTS won't alter an already-created table, so drop it once if it's
// still in an older shape missing the current "age" column.
const profileColumns = db.getAllSync<{ name: string }>("PRAGMA table_info(profile)");
const hasAgeColumn = profileColumns.some((column) => column.name === "age");
if (profileColumns.length > 0 && !hasAgeColumn) {
    db.execSync("DROP TABLE IF EXISTS profile;");
}

db.execSync(`
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    weight_kg REAL NOT NULL,
    height_cm REAL NOT NULL,
    reminder_time TEXT NOT NULL DEFAULT '18:00',
    reminders_enabled INTEGER NOT NULL DEFAULT 1,
    theme TEXT NOT NULL DEFAULT 'system',
    gender TEXT NOT NULL DEFAULT 'male',
    target_weight_kg REAL,
    goal TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    finished_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id),
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    equipment TEXT NOT NULL,
    muscle TEXT NOT NULL,
    bar_weight_kg REAL NOT NULL DEFAULT 0,
    work_seconds INTEGER NOT NULL DEFAULT 0,
    rest_seconds INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS workout_sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_exercise_id INTEGER NOT NULL REFERENCES workout_exercises(id),
    set_index INTEGER NOT NULL,
    weight_kg REAL NOT NULL,
    reps INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS custom_workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    muscle_groups TEXT NOT NULL,
    has_bar_weight INTEGER NOT NULL DEFAULT 0,
    bar_weight_kg REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// Additive migration for installs whose profile table predates reminder_time/reminders_enabled
// (already has "age" so wasn't dropped above) — ALTER TABLE keeps existing profile data intact.
const profileColumnsAfterCreate = db.getAllSync<{ name: string }>("PRAGMA table_info(profile)");
if (!profileColumnsAfterCreate.some((column) => column.name === "reminder_time")) {
    db.execSync("ALTER TABLE profile ADD COLUMN reminder_time TEXT NOT NULL DEFAULT '18:00';");
}
if (!profileColumnsAfterCreate.some((column) => column.name === "reminders_enabled")) {
    db.execSync("ALTER TABLE profile ADD COLUMN reminders_enabled INTEGER NOT NULL DEFAULT 1;");
}
if (!profileColumnsAfterCreate.some((column) => column.name === "theme")) {
    db.execSync("ALTER TABLE profile ADD COLUMN theme TEXT NOT NULL DEFAULT 'system';");
}
if (!profileColumnsAfterCreate.some((column) => column.name === "gender")) {
    db.execSync("ALTER TABLE profile ADD COLUMN gender TEXT NOT NULL DEFAULT 'male';");
}
if (!profileColumnsAfterCreate.some((column) => column.name === "target_weight_kg")) {
    db.execSync("ALTER TABLE profile ADD COLUMN target_weight_kg REAL;");
}
if (!profileColumnsAfterCreate.some((column) => column.name === "goal")) {
    db.execSync("ALTER TABLE profile ADD COLUMN goal TEXT;");
}

// Additive migrations for installs that predate the bar-weight columns. Existing
// logged exercises/custom workouts simply default to 0 (no retroactive guessing).
const workoutExerciseColumns = db.getAllSync<{ name: string }>("PRAGMA table_info(workout_exercises)");
if (!workoutExerciseColumns.some((column) => column.name === "bar_weight_kg")) {
    db.execSync("ALTER TABLE workout_exercises ADD COLUMN bar_weight_kg REAL NOT NULL DEFAULT 0;");
}
if (!workoutExerciseColumns.some((column) => column.name === "work_seconds")) {
    db.execSync("ALTER TABLE workout_exercises ADD COLUMN work_seconds INTEGER NOT NULL DEFAULT 0;");
}
if (!workoutExerciseColumns.some((column) => column.name === "rest_seconds")) {
    db.execSync("ALTER TABLE workout_exercises ADD COLUMN rest_seconds INTEGER NOT NULL DEFAULT 0;");
}
const customWorkoutColumns = db.getAllSync<{ name: string }>("PRAGMA table_info(custom_workouts)");
if (!customWorkoutColumns.some((column) => column.name === "has_bar_weight")) {
    db.execSync("ALTER TABLE custom_workouts ADD COLUMN has_bar_weight INTEGER NOT NULL DEFAULT 0;");
}
if (!customWorkoutColumns.some((column) => column.name === "bar_weight_kg")) {
    db.execSync("ALTER TABLE custom_workouts ADD COLUMN bar_weight_kg REAL NOT NULL DEFAULT 0;");
}
