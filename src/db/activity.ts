import { db } from "@/db/client";

export type DayActivity = {
    date: string;
    count: number;
};

export const getDailyActivityForMonth = (year: number, month: number): DayActivity[] => {
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 1).toISOString();

    const rows = db.getAllSync<{ day: string; count: number }>(
        `SELECT date(started_at) AS day, COUNT(*) AS count
         FROM workouts
         WHERE started_at >= ? AND started_at < ?
         GROUP BY day`,
        [start, end]
    );

    return rows.map((row) => ({ date: row.day, count: row.count }));
};

export type MonthRef = { year: number; month: number };

export const getActivityMonthRange = (): MonthRef[] => {
    const earliest = db.getFirstSync<{ started_at: string | null }>(
        "SELECT MIN(started_at) AS started_at FROM workouts"
    );
    if (!earliest?.started_at) return [];

    const start = new Date(earliest.started_at);
    const now = new Date();

    const months: MonthRef[] = [];
    let year = now.getFullYear();
    let month = now.getMonth();

    while (year > start.getFullYear() || (year === start.getFullYear() && month >= start.getMonth())) {
        months.push({ year, month });
        month -= 1;
        if (month < 0) {
            month = 11;
            year -= 1;
        }
    }

    return months;
};
