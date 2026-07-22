import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
};

/**
 * Schedules a single repeating daily notification 15 minutes before reminderTime
 * ("HH:MM", 24h). The OS fires this even when the app isn't running, so the
 * content is fixed at scheduling time rather than rotated per-day.
 */
export const scheduleGymReminder = async (reminderTime: string) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const [hour, minute] = reminderTime.split(":").map(Number);
    let notifyHour = hour;
    let notifyMinute = minute - 15;
    if (notifyMinute < 0) {
        notifyMinute += 60;
        notifyHour = (notifyHour - 1 + 24) % 24;
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Ready to hit the gym? 💪",
            body: "A little sweat today buys you energy, mood, and strength tomorrow — let's make it count.",
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: notifyHour,
            minute: notifyMinute,
        },
    });
};

export const cancelGymReminder = () => Notifications.cancelAllScheduledNotificationsAsync();
