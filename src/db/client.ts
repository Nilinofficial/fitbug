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
    muscle TEXT NOT NULL
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
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS custom_workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_workout_id INTEGER NOT NULL REFERENCES custom_workouts(id),
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    equipment TEXT NOT NULL,
    muscle TEXT NOT NULL,
    target_sets INTEGER NOT NULL,
    target_reps_min INTEGER NOT NULL,
    target_reps_max INTEGER NOT NULL,
    position INTEGER NOT NULL
  );
`);
