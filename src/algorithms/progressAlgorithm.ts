/**
 * Estimated one-rep max via the Epley formula — a standard, widely used
 * approximation (not a substitute for an actual tested 1RM).
 */
export const estimateOneRepMax = (weightKg: number, reps: number): number => {
    if (weightKg <= 0 || reps <= 0) return 0;
    if (reps === 1) return weightKg;
    return weightKg * (1 + reps / 30);
};

export type ProgressRow = {
    date: string;
    weightKg: number;
    reps: number;
};

export type ProgressBucket = {
    label: string;
    estimated1RM: number;
    volumeKg: number;
};

const MS_PER_DAY = 86400000;
const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const startOfWeek = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
};

/**
 * Buckets raw set rows into the last `bucketCount` fixed calendar periods
 * (weeks or months), counting back from today. Empty periods are zero-filled
 * so the chart always has a consistent number of points. Each bucket's value
 * is the best estimated 1RM achieved in that period, plus total volume moved.
 */
export const bucketProgress = (
    rows: ProgressRow[],
    granularity: "week" | "month",
    bucketCount = 6
): ProgressBucket[] => {
    const now = new Date();
    const periods: { label: string; start: Date; end: Date }[] = [];

    if (granularity === "week") {
        const currentWeekStart = startOfWeek(now);
        for (let i = bucketCount - 1; i >= 0; i--) {
            const start = new Date(currentWeekStart.getTime() - i * 7 * MS_PER_DAY);
            const end = new Date(start.getTime() + 7 * MS_PER_DAY);
            periods.push({ label: `W${bucketCount - i}`, start, end });
        }
    } else {
        for (let i = bucketCount - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            periods.push({ label: MONTH_SHORT[start.getMonth()], start, end });
        }
    }

    return periods.map(({ label, start, end }) => {
        const rowsInPeriod = rows.filter((row) => {
            const time = new Date(row.date).getTime();
            return time >= start.getTime() && time < end.getTime();
        });

        const estimated1RM = rowsInPeriod.reduce(
            (max, row) => Math.max(max, estimateOneRepMax(row.weightKg, row.reps)),
            0
        );
        const volumeKg = rowsInPeriod.reduce((sum, row) => sum + row.weightKg * row.reps, 0);

        return {
            label,
            estimated1RM: Math.round(estimated1RM),
            volumeKg: Math.round(volumeKg),
        };
    });
};
