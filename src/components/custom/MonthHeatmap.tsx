import { Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { getDailyActivityForMonth } from "@/db/activity";
import { formatMonthYearParts } from "@/lib/format";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const getColor = (count: number) => {
    if (count <= 0) return "#EDEEF2";
    if (count === 1) return "#86EFAC";
    return "#16A34A";
};

const pad = (n: number) => n.toString().padStart(2, "0");

type MonthHeatmapProps = {
    year: number;
    month: number;
};

const MonthHeatmap = ({ year, month }: MonthHeatmapProps) => {
    const activity = getDailyActivityForMonth(year, month);
    const countByDay = new Map(activity.map((a) => [a.date, a.count]));

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const cells: (number | null)[] = [
        ...Array(firstWeekday).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return (
        <View style={{ gap: 10 }}>
            <Text style={{ color: "#20242d", fontSize: 14, fontFamily: Fonts.bold }}>
                {formatMonthYearParts(year, month)}
            </Text>

            <View style={{ flexDirection: "row" }}>
                {WEEKDAY_LABELS.map((label, index) => (
                    <Text
                        key={index}
                        style={{
                            flex: 1,
                            textAlign: "center",
                            color: "#9599a5",
                            fontSize: 10,
                            fontFamily: Fonts.medium,
                        }}
                    >
                        {label}
                    </Text>
                ))}
            </View>

            <View style={{ gap: 4 }}>
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={{ flexDirection: "row", gap: 4 }}>
                        {week.map((day, dayIndex) => {
                            if (day === null) {
                                return <View key={dayIndex} style={{ flex: 1, aspectRatio: 1 }} />;
                            }
                            const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
                            const count = countByDay.get(dateKey) ?? 0;
                            return (
                                <View
                                    key={dayIndex}
                                    style={{
                                        flex: 1,
                                        aspectRatio: 1,
                                        borderRadius: 4,
                                        backgroundColor: getColor(count),
                                    }}
                                />
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default MonthHeatmap;
