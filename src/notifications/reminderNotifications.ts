import Constants, { AppOwnership } from "expo-constants";
import * as Notifications from "expo-notifications";

// Android push/local-notification support was removed from Expo Go in SDK 53 — calling
// almost any expo-notifications API there throws synchronously. Everything below is a
// no-op in Expo Go so the app never crashes on boot; a real dev/standalone build is
// required for reminders to actually work.
const isExpoGo = Constants.appOwnership === AppOwnership.Expo;

if (isExpoGo) {
    console.warn(
        "[reminders] Running in Expo Go — local notifications are unavailable (removed in SDK 53). " +
            "Use a development build to test gym reminders."
    );
} else {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

const CHANNEL_ID = "gym-reminders";

// Android hides notifications posted to a channel that doesn't exist yet or that
// defaults to low importance — without this, scheduled notifications can silently
// never appear even though scheduling itself succeeds.
const ensureNotificationChannel = async () => {
    if (isExpoGo) return;
    try {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
            name: "Gym Reminders",
            importance: Notifications.AndroidImportance.HIGH,
            // Omitting `sound` (rather than passing "default") is what makes Android use
            // the actual system default notification sound — any string value here is
            // looked up as a bundled custom sound file and fails if none exists.
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#1263df",
        });
    } catch (error) {
        console.warn("[reminders] Failed to set up notification channel", error);
    }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (isExpoGo) return false;

    try {
        await ensureNotificationChannel();
        const existing = await Notifications.getPermissionsAsync();
        if (existing.status === "granted") return true;
        const requested = await Notifications.requestPermissionsAsync();
        return requested.status === "granted";
    } catch (error) {
        console.warn("[reminders] Failed to request notification permission", error);
        return false;
    }
};

/**
 * Schedules a single repeating daily notification 15 minutes before gymTime
 * ("HH:MM", 24h). The OS fires this even when the app isn't running, so the
 * content is fixed at scheduling time rather than rotated per-day.
 */
export const scheduleGymReminder = async (gymTime: string) => {
    if (isExpoGo) return;

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await ensureNotificationChannel();

        const [hour, minute] = gymTime.split(":").map(Number);
        let notifyHour = hour;
        let notifyMinute = minute - 15;
        if (notifyMinute < 0) {
            notifyMinute += 60;
            notifyHour = (notifyHour - 1 + 24) % 24;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Ready to hit the gym? 💪",
                body: "A little sweat today buys you energy, mood, and strength tomorrow. Let's make it count.",
                // On Android, actual sound playback is governed by the channel's sound
                // (set in ensureNotificationChannel); a string here is looked up as a
                // custom sound file, so only `true`/`false` are valid at the content level.
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: notifyHour,
                minute: notifyMinute,
                channelId: CHANNEL_ID,
            },
        });
    } catch (error) {
        console.warn("[reminders] Failed to schedule gym reminder", error);
    }
};

export const cancelGymReminder = async () => {
    if (isExpoGo) return;

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.warn("[reminders] Failed to cancel gym reminder", error);
    }
};
