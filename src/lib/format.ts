export const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

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
