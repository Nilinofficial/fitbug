import { Pressable, Text, View } from "react-native";

import { Fonts } from "@/constants/fonts";
import { getDailyActivityForMonth } from "@/db/activity";
import { formatMonthYearParts } from "@/lib/format";
import { useAppTheme } from "@/theme/ThemeProvider";
import { ThemeTokens } from "@/theme/tokens";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const getColor = (count: number, colors: ThemeTokens) => {
    if (count <= 0) return colors.surfaceMuted;
    if (count === 1) return "#86EFAC";
    return "#16A34A";
};

const pad = (n: number) => n.toString().padStart(2, "0");

type MonthHeatmapProps = {
    year: number;
    month: number;
    onDayPress?: (dateISO: string) => void;
};

const MonthHeatmap = ({ year, month, onDayPress }: MonthHeatmapProps) => {
    const { colors } = useAppTheme();
    const activity = getDailyActivityForMonth(year, month);
    const countByDay = new Map(activity.map((a) => [a.date, a.count]));
    const todayKey = (() => {
        const now = new Date();
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    })();

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
            <Text style={{ color: colors.textPrimary, fontSize: 14, fontFamily: Fonts.bold }}>
                {formatMonthYearParts(year, month)}
            </Text>

            <View style={{ flexDirection: "row" }}>
                {WEEKDAY_LABELS.map((label, index) => (
                    <Text
                        key={index}
                        style={{
                            flex: 1,
                            textAlign: "center",
                            color: colors.textSecondary,
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
                            const isFuture = dateKey > todayKey;
                            const isTappable = Boolean(onDayPress) && count === 0 && !isFuture;

                            const cellStyle = {
                                flex: 1,
                                aspectRatio: 1,
                                borderRadius: 4,
                                backgroundColor: getColor(count, colors),
                                opacity: isFuture ? 0.4 : 1,
                            } as const;

                            if (isTappable) {
                                return (
                                    <Pressable
                                        key={dayIndex}
                                        onPress={() => onDayPress?.(dateKey)}
                                        style={cellStyle}
                                    />
                                );
                            }
                            return <View key={dayIndex} style={cellStyle} />;
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
};

export default MonthHeatmap;
