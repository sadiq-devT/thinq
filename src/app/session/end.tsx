import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { useSession } from '@/context'
import { saveSessionToSupabase, saveSessionLocally } from '@/services/sessionService'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

const PLACEHOLDER_SUMMARY = {
    line1: 'You talked about work pressure and a decision you\'ve been avoiding.',
    line2: 'Something important: you mentioned the real issue might be fear of being wrong.',
    line3: 'One thread to revisit: the conversation with your manager next week.',
    tags: ['work', 'decisions', 'career'],
}

export default function SessionEndScreen() {
    const router = useRouter()
    const { user } = useAuth()
    const { state } = useSession()
    const [saving, setSaving] = useState(true)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [retrying, setRetrying] = useState(false)

    useEffect(() => {
        const saveSession = async () => {
            if (!user || !state.sessionId) {
                setSaving(false)
                return
            }

            const transcript = state.messages.map((m) => ({
                role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: m.content,
            }))

            try {
                await saveSessionToSupabase({
                    userId: user.id,
                    sessionId: state.sessionId,
                    startedAt: new Date(Date.now() - state.timeAvailableMinutes * 60 * 1000),
                    endedAt: new Date(),
                    durationMinutes: state.timeAvailableMinutes,
                    sessionType: state.inputMode === 'voice' ? 'voice' : 'text',
                    timeAvailableMinutes: state.timeAvailableMinutes,
                    openingQuestion: state.openingQuestion,
                    messages: transcript,
                })
                setSaving(false)
            } catch (err: any) {
                setSaveError(err.message || 'Failed to save session')
                setSaving(false)
                // Backup to AsyncStorage
                try {
                    await saveSessionLocally({
                        userId: user.id,
                        sessionId: state.sessionId,
                        startedAt: new Date(Date.now() - state.timeAvailableMinutes * 60 * 1000),
                        endedAt: new Date(),
                        durationMinutes: state.timeAvailableMinutes,
                        sessionType: state.inputMode === 'voice' ? 'voice' : 'text',
                        timeAvailableMinutes: state.timeAvailableMinutes,
                        openingQuestion: state.openingQuestion,
                        messages: transcript,
                    })
                } catch (backupErr) {
                    console.error('Backup save failed:', backupErr)
                }
            }
        }

        const timer = setTimeout(saveSession, 500)
        return () => clearTimeout(timer)
    }, [user, state.sessionId, state.messages])

    const handleRetry = async () => {
        if (!user || !state.sessionId) return
        setRetrying(true)
        setSaveError(null)
        const retryTranscript = state.messages.map((m) => ({
            role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
            content: m.content,
        }))
        try {
            await saveSessionToSupabase({
                userId: user.id,
                sessionId: state.sessionId,
                startedAt: new Date(Date.now() - state.timeAvailableMinutes * 60 * 1000),
                endedAt: new Date(),
                durationMinutes: state.timeAvailableMinutes,
                sessionType: state.inputMode === 'voice' ? 'voice' : 'text',
                timeAvailableMinutes: state.timeAvailableMinutes,
                openingQuestion: state.openingQuestion,
                messages: retryTranscript,
            })
            setSaveError(null)
        } catch (err: any) {
            setSaveError(err.message || 'Still failing')
        } finally {
            setRetrying(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Success indicator */}
            <View style={styles.successSection}>
                {saving ? (
                    <>
                        <ActivityIndicator size="small" color={colors.light.accent} />
                        <Text style={styles.successLabel}>Saving your session…</Text>
                    </>
                ) : saveError ? (
                    <>
                        <View style={[styles.checkCircle, { backgroundColor: colors.light.danger }]}>
                            <Text style={styles.errorIcon}>!</Text>
                        </View>
                        <Text style={[styles.successLabel, { color: colors.light.danger }]}>
                            Save failed
                        </Text>
                        <TouchableOpacity onPress={handleRetry} disabled={retrying}>
                            <Text style={styles.retryText}>
                                {retrying ? 'Retrying…' : 'Tap to retry'}
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <View style={styles.checkCircle}>
                            <View style={styles.checkMark}>
                                <View style={styles.checkShort} />
                                <View style={styles.checkLong} />
                            </View>
                        </View>
                        <Text style={styles.successLabel}>Session complete</Text>
                    </>
                )}
            </View>

            {/* Duration */}
            <View style={styles.durationSection}>
                <Text style={styles.durationText}>
                    You thought for {state.timeAvailableMinutes} minutes
                </Text>
            </View>

            {/* Summary card */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryHeader}>WHAT CAME UP</Text>
                <View style={styles.summaryLines}>
                    <Text style={styles.summaryLine}>{PLACEHOLDER_SUMMARY.line1}</Text>
                    <Text style={styles.summaryLine}>{PLACEHOLDER_SUMMARY.line2}</Text>
                    <Text style={styles.summaryLine}>{PLACEHOLDER_SUMMARY.line3}</Text>
                </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsRow}>
                {PLACEHOLDER_SUMMARY.tags.map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                        <Text style={styles.tagText}>{tag}</Text>
                    </View>
                ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push('/(tabs)')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Go to home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => state.sessionId && router.push(`/session/${state.sessionId}`)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.secondaryButtonText}>Read full session</Text>
                </TouchableOpacity>
            </View>

            {/* Teaser */}
            <View style={styles.teaserSection}>
                <Text style={styles.teaserText}>
                    Tomorrow: pick up where you left off, or start fresh.
                </Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background, paddingHorizontal: 24 } as ViewStyle,
    successSection: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, gap: 8 } as ViewStyle,
    checkCircle: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: colors.light.success,
        alignItems: 'center', justifyContent: 'center',
    } as ViewStyle,
    errorIcon: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' } as TextStyle,
    checkMark: { width: 14, height: 10, position: 'relative' } as ViewStyle,
    checkShort: {
        position: 'absolute', width: 6, height: 2, backgroundColor: '#FFFFFF',
        borderRadius: 1, bottom: 2, left: 0, transform: [{ rotate: '-45deg' }],
    } as ViewStyle,
    checkLong: {
        position: 'absolute', width: 10, height: 2, backgroundColor: '#FFFFFF',
        borderRadius: 1, bottom: 4, left: 4, transform: [{ rotate: '45deg' }],
    } as ViewStyle,
    successLabel: { ...(typography.caption as object), color: colors.light.textSecondary } as TextStyle,
    retryText: { ...(typography.caption as object), color: colors.light.accent } as TextStyle,
    durationSection: { alignItems: 'center', paddingBottom: 28 } as ViewStyle,
    durationText: { fontSize: 20, fontWeight: '500', color: colors.light.textPrimary } as TextStyle,
    summaryCard: { backgroundColor: colors.light.surface, borderRadius: 16, padding: 20, marginBottom: 20 } as ViewStyle,
    summaryHeader: { fontSize: 11, fontWeight: '600', color: colors.light.textTertiary, letterSpacing: 1, marginBottom: 12 } as TextStyle,
    summaryLines: { gap: 10 } as ViewStyle,
    summaryLine: { ...(typography.bodySmall as object), color: colors.light.textSecondary, lineHeight: 20 } as TextStyle,
    tagsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingBottom: 32 } as ViewStyle,
    tagPill: { backgroundColor: colors.light.buttonSecondary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 } as ViewStyle,
    tagText: { fontSize: 13, color: colors.light.textSecondary } as TextStyle,
    buttonSection: { paddingBottom: 16 } as ViewStyle,
    primaryButton: {
        backgroundColor: colors.light.accent, height: 56, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    } as ViewStyle,
    primaryButtonText: { ...(typography.button as object), color: '#FFFFFF' } as TextStyle,
    secondaryButton: { height: 44, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
    secondaryButtonText: { ...(typography.body as object), color: colors.light.textSecondary } as TextStyle,
    teaserSection: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 } as ViewStyle,
    teaserText: { fontSize: 14, fontStyle: 'italic', color: colors.light.textTertiary, textAlign: 'center' } as TextStyle,
})