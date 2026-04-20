import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'
import { getUserPatterns, getSessionCount } from '@/services/patterns'
import { useAuth } from '@/context/AuthContext'

interface PatternItem {
    pattern_text: string
    confidence: 'high' | 'medium'
    occurrences: number
    last_seen?: string
}

function PatternCard({ item, index }: { item: PatternItem; index: number }) {
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(250)}
            style={styles.patternCard}
        >
            <View style={styles.cardAccent} />
            <View style={styles.cardContent}>
                <Text style={styles.patternText}>{item.pattern_text}</Text>
                <Text style={styles.patternMeta}>
                    Mentioned {item.occurrences} times
                </Text>
            </View>
        </Animated.View>
    )
}

export default function PatternsScreen() {
    const { user } = useAuth()
    const [patterns, setPatterns] = useState<PatternItem[]>([])
    const [sessionCount, setSessionCount] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user?.id) return

        const load = async () => {
            const [fetchedPatterns, count] = await Promise.all([
                getUserPatterns(user.id),
                getSessionCount(user.id),
            ])

            setPatterns(fetchedPatterns)
            setSessionCount(count)
            setLoading(false)
        }
        load()
    }, [user?.id])

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>What I've noticed</Text>
                    <Text style={styles.subtitle}>Patterns in your thinking across all sessions</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={colors.light.accent} />
                </View>
            </SafeAreaView>
        )
    }

    if (sessionCount < 3) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>What I've noticed</Text>
                    <Text style={styles.subtitle}>Patterns in your thinking across all sessions</Text>
                </View>
                <View style={styles.emptyState}>
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            Keep having sessions — patterns appear after a few conversations.
                        </Text>
                        <View style={styles.progressSection}>
                            <Text style={styles.progressLabel}>
                                {sessionCount} of 3 sessions needed
                            </Text>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${Math.min((sessionCount / 3) * 100, 100)}%` },
                                    ]}
                                />
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Patterns update after each session</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>What I've noticed</Text>
                <Text style={styles.subtitle}>Patterns in your thinking across all sessions</Text>
            </View>

            <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                    Based on {sessionCount} sessions
                </Text>
            </View>

            {patterns.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                            Patterns are being identified. Check back after a few more sessions.
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={styles.list}>
                    {patterns.map((item, index) => (
                        <PatternCard key={index} item={item} index={index} />
                    ))}
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>Patterns update after each session</Text>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
    title: { fontSize: 22, fontWeight: '500', color: colors.light.textPrimary },
    subtitle: { fontSize: 14, color: colors.light.textSecondary, marginTop: 4 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    statsRow: { paddingHorizontal: 24, paddingVertical: 12 },
    statsText: { fontSize: 12, color: colors.light.textTertiary },
    list: { paddingHorizontal: 24, paddingBottom: 24 },
    patternCard: {
        backgroundColor: colors.light.surface,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    cardAccent: { width: 3, backgroundColor: colors.light.accent },
    cardContent: { flex: 1, padding: 16 },
    patternText: { fontSize: 15, fontWeight: '400', color: colors.light.textPrimary, lineHeight: 22, marginBottom: 8 },
    patternMeta: { fontSize: 12, color: colors.light.textTertiary },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    emptyCard: { backgroundColor: colors.light.surface, borderRadius: 16, padding: 24, alignItems: 'center', maxWidth: 280 },
    emptyText: { ...typography.body, color: colors.light.textSecondary, textAlign: 'center', marginBottom: 20 },
    progressSection: { alignItems: 'center', width: '100%' },
    progressLabel: { fontSize: 12, color: colors.light.textTertiary, marginBottom: 8 },
    progressBar: { width: '100%', height: 4, backgroundColor: colors.light.border, borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.light.accent, borderRadius: 2 },
    footer: { paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' },
    footerText: { fontSize: 12, color: colors.light.textTertiary },
})