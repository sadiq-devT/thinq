import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import {
    getNotificationSettings,
    saveNotificationSettings,
    requestNotificationPermissions,
    scheduleDailyReminder,
    scheduleStreakReminder,
    type NotificationSettings,
} from '@/services/notifications'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'
import { getSessionCount } from '@/services/patterns'
import { supabase } from '@/lib/supabase'

export default function SettingsScreen() {
    const router = useRouter()
    const { user, signOut } = useAuth()

    const [settings, setSettings] = useState<NotificationSettings>({
        reminderEnabled: true,
        reminderHour: 8,
        reminderMinute: 0,
        streakReminderEnabled: true,
        patternReminderEnabled: true,
        dailyReminderEnabled: true,
    })
    const [showTimePicker, setShowTimePicker] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadSettings()
        loadUserProfile()
    }, [user])

    const loadSettings = async () => {
        const stored = await getNotificationSettings()
        setSettings(stored)
    }

    const loadUserProfile = async () => {
        if (!user) return
        const { data } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', user.id)
            .single()
        if (data?.display_name) {
            setDisplayName(data.display_name)
        }
    }

    const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
        const updated = { ...settings, [key]: value }
        setSettings(updated)
        await saveNotificationSettings(updated)
        await rescheduleAfterChange(updated)
    }

    const handleTimeChange = async (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios')
        if (selectedDate) {
            const hour = selectedDate.getHours()
            const minute = selectedDate.getMinutes()
            const updated = { ...settings, reminderHour: hour, reminderMinute: minute }
            setSettings(updated)
            await saveNotificationSettings(updated)
            await rescheduleAfterChange(updated)
        }
    }

    const rescheduleAfterChange = async (updated: NotificationSettings) => {
        if (user) {
            const count = await getSessionCount(user.id)
            const streak = calculateStreak(count)
            if (streak >= 3) {
                await scheduleStreakReminder(streak)
            }
        }
        if (updated.dailyReminderEnabled && updated.reminderEnabled) {
            await scheduleDailyReminder(updated)
        }
    }

    const calculateStreak = (sessionCount: number): number => {
        // Placeholder: in production, this would check actual session dates
        return sessionCount >= 3 ? Math.min(sessionCount, 14) : 0
    }

    const formatTime = (hour: number, minute: number): string => {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
    }

    const handleSignOut = async () => {
        Alert.alert('Sign out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign out',
                style: 'destructive',
                onPress: async () => {
                    await signOut()
                    router.replace('/auth/sign-in')
                },
            },
        ])
    }

    const handleSaveDisplayName = async () => {
        if (!user || !displayName.trim()) return
        setLoading(true)
        try {
            await supabase
                .from('users')
                .update({ display_name: displayName.trim() })
                .eq('id', user.id)
            Alert.alert('Saved', 'Display name updated.')
        } catch (err) {
            Alert.alert('Error', 'Could not save display name.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowLabel}>Daily reminder</Text>
                            <Text style={styles.rowDescription}>Get reminded to have a thinking session</Text>
                        </View>
                        <Switch
                            value={settings.dailyReminderEnabled}
                            onValueChange={(v) => handleToggle('dailyReminderEnabled', v)}
                            trackColor={{ false: colors.light.border, true: colors.light.accent }}
                        />
                    </View>

                    {settings.dailyReminderEnabled && (
                        <>
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <View style={styles.rowText}>
                                    <Text style={styles.rowLabel}>Reminder time</Text>
                                    <Text style={styles.rowDescription}>
                                        {formatTime(settings.reminderHour, settings.reminderMinute)}
                                    </Text>
                                </View>
                                <Text style={styles.chevron}>›</Text>
                            </TouchableOpacity>

                            <View style={styles.row}>
                                <View style={styles.rowText}>
                                    <Text style={styles.rowLabel}>Streak reminders</Text>
                                    <Text style={styles.rowDescription}>Remind me when I'm close to breaking a streak</Text>
                                </View>
                                <Switch
                                    value={settings.streakReminderEnabled}
                                    onValueChange={(v) => handleToggle('streakReminderEnabled', v)}
                                    trackColor={{ false: colors.light.border, true: colors.light.accent }}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={styles.rowText}>
                                    <Text style={styles.rowLabel}>Pattern alerts</Text>
                                    <Text style={styles.rowDescription}>Notify when new patterns are detected</Text>
                                </View>
                                <Switch
                                    value={settings.patternReminderEnabled}
                                    onValueChange={(v) => handleToggle('patternReminderEnabled', v)}
                                    trackColor={{ false: colors.light.border, true: colors.light.accent }}
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>PROFILE</Text>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Display name</Text>
                        <View style={styles.inputRowRight}>
                            <View style={styles.textInput}>
                                <TouchableOpacity
                                    style={styles.displayNameInput}
                                    onPress={() => Alert.prompt?.('Display name', 'Enter your name', (val) => {
                                        if (val) setDisplayName(val)
                                    })}
                                >
                                    <Text style={styles.displayNameText}>
                                        {displayName || 'Not set'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveDisplayName}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Sign Out */}
                <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                    <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>
            </ScrollView>

            {showTimePicker && (
                <DateTimePicker
                    value={new Date(2024, 0, 1, settings.reminderHour, settings.reminderMinute)}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 24, color: colors.light.textSecondary },
    headerTitle: { fontSize: 16, fontWeight: '600', color: colors.light.textPrimary },
    headerSpacer: { width: 36 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    section: { marginBottom: 32 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.light.textTertiary,
        letterSpacing: 1,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    rowText: { flex: 1, marginRight: 16 },
    rowLabel: { ...typography.body, color: colors.light.textPrimary },
    rowDescription: { ...typography.caption, color: colors.light.textTertiary, marginTop: 2 },
    chevron: { fontSize: 20, color: colors.light.textTertiary },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.light.border,
    },
    inputLabel: { ...typography.body, color: colors.light.textPrimary },
    inputRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    textInput: { flexDirection: 'row', alignItems: 'center' },
    displayNameInput: { paddingHorizontal: 12, paddingVertical: 8 },
    displayNameText: { ...typography.body, color: colors.light.textSecondary },
    saveButton: {
        backgroundColor: colors.light.accent,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    signOutButton: {
        alignItems: 'center',
        paddingVertical: 16,
        marginTop: 16,
    },
    signOutText: { ...typography.body, color: colors.light.danger },
})