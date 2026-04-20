import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const NOTIFICATION_SETTINGS_KEY = '@thinq/notification_settings'

export interface NotificationSettings {
    reminderEnabled: boolean
    reminderHour: number // 0-23
    reminderMinute: number // 0-59
    streakReminderEnabled: boolean
    patternReminderEnabled: boolean
    dailyReminderEnabled: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
    reminderEnabled: true,
    reminderHour: 8,
    reminderMinute: 0,
    streakReminderEnabled: true,
    patternReminderEnabled: true,
    dailyReminderEnabled: true,
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY)
    if (!stored) return DEFAULT_SETTINGS
    try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    } catch {
        return DEFAULT_SETTINGS
    }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings))
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    if (existingStatus === 'granted') return true

    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
}

// Cancel all pending notifications
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
}

// Schedule daily reminder notification
export async function scheduleDailyReminder(settings: NotificationSettings): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
    if (!settings.reminderEnabled || !settings.dailyReminderEnabled) return

    const messages = getDayBasedMessages()

    // Schedule one notification for each day of the week (7 notifications)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const ids: string[] = []

    for (let i = 0; i < 7; i++) {
        const dayName = days[i]
        const message = messages[i]

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Thinq',
                body: message,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                weekday: i + 1, // 1 = Sunday, 7 = Saturday
                hour: settings.reminderHour,
                minute: settings.reminderMinute,
            },
        })
        ids.push(id)
    }
}

// Get day-based messages for weekly schedule
function getDayBasedMessages(): string[] {
    return [
        "New week. What are you carrying into it?",       // Sunday
        "New week. What are you carrying into it?",       // Monday
        "Something on your mind?",                          // Tuesday
        "Midweek check-in. How are things actually going?", // Wednesday
        "Got 5 minutes? Your thoughts are waiting.",        // Thursday
        "End of week. What do you want to put down before the weekend?", // Friday
        "Quick thinking session?",                          // Saturday
    ]
}

// Schedule streak reminder (fires at 8pm if user has 3+ day streak and hasn't opened today)
export async function scheduleStreakReminder(streakDays: number): Promise<void> {
    if (streakDays < 3) return

    const settings = await getNotificationSettings()
    if (!settings.streakReminderEnabled) return

    // Cancel any existing streak reminder first
    const existing = await Notifications.getAllScheduledNotificationsAsync()
    const streakNotifications = existing.filter((n) => n.identifier.startsWith('streak-'))
    for (const n of streakNotifications) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Thinq',
            body: `Don't break your ${streakDays}-day streak. One quick session.`,
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 20, // 8pm
            minute: 0,
        },
    })
}

// Pattern ready notification — triggered immediately when patterns are detected
export async function sendPatternReadyNotification(): Promise<void> {
    const settings = await getNotificationSettings()
    if (!settings.patternReminderEnabled) return

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Thinq',
            body: 'New patterns noticed in your thinking. Take a look.',
            sound: true,
        },
        trigger: null, // Fire immediately
    })
}

// Update all notifications based on current settings
export async function updateAllNotifications(streakDays: number): Promise<void> {
    const settings = await getNotificationSettings()
    await scheduleDailyReminder(settings)
    if (streakDays >= 3) {
        await scheduleStreakReminder(streakDays)
    }
}

// Reschedule notifications (call this on app start)
export async function rescheduleNotifications(streakDays: number): Promise<void> {
    await updateAllNotifications(streakDays)
}