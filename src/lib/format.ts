export const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export const WEEKDAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const formatDayHeader = (iso: string): string => {
    const date = new Date(iso);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return "Today";

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
};

export const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
};

export const formatTime = (iso: string): string => {
    const date = new Date(iso);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
};

export const formatMonthYear = (iso: string): string => {
    const date = new Date(iso);
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatMonthYearParts = (year: number, month: number): string => `${MONTHS[month]} ${year}`;

export const parseReminderTime = (reminderTime: string): { hour: number; minute: number } => {
    const [hour, minute] = reminderTime.split(":").map(Number);
    return { hour: hour || 0, minute: minute || 0 };
};

export const formatReminderTime = (hour: number, minute: number): string =>
    `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

export const formatReminderTimeDisplay = (reminderTime: string): string => {
    const { hour, minute } = parseReminderTime(reminderTime);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

export const formatElapsedSeconds = (totalSeconds: number): string => {
    const safe = Math.max(0, Math.round(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
