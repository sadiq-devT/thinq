import React, { useState } from 'react'
import { View, Text, FlatList, TextInput, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessions } from '@/hooks/useSessions'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

function timeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
}

export default function SessionsScreen() {
    const router = useRouter()
    const { sessions, loading, error, refresh, search } = useSessions()
    const [searchQuery, setSearchQuery] = useState('')

    const displayedSessions = searchQuery ? search(searchQuery) : sessions

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const summary = item.summary_3_lines || item.messages?.[0]?.content || ''
        const tags = item.tags || []
        const date = new Date(item.started_at)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        return (
            <>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => router.push(`/session/${item.id}`)}
                    activeOpacity={0.7}
                >
                    <View style={styles.cardTop}>
                        <View style={styles.dateRow}>
                            <Text style={styles.date}>{dateStr}</Text>
                            <Text style={styles.daysAgo}>{timeAgo(item.started_at)}</Text>
                        </View>
                        <View style={styles.durationPill}>
                            <Text style={styles.durationText}>{item.duration_minutes} min</Text>
                        </View>
                    </View>

                    <Text style={styles.summary} numberOfLines={1} ellipsizeMode="tail">
                        {summary.split('\n')[0] || 'Session'}
                    </Text>

                    <View style={styles.tagsRow}>
                        {tags.slice(0, 3).map((tag: string) => (
                            <View key={tag} style={styles.tagPill}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                        {item.session_type === 'voice' && (
                            <Text style={styles.typeIndicator}>🎤</Text>
                        )}
                    </View>
                </TouchableOpacity>
                {index < displayedSessions.length - 1 && <View style={styles.separator} />}
            </>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Your sessions</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search your thoughts…"
                    placeholderTextColor={colors.light.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <Text style={styles.loadingText}>Loading sessions…</Text>
                </View>
            ) : error ? (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Failed to load sessions</Text>
                    <TouchableOpacity onPress={refresh}>
                        <Text style={styles.retryText}>Tap to retry</Text>
                    </TouchableOpacity>
                </View>
            ) : displayedSessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyIllustration} />
                    <Text style={styles.emptyText}>No sessions yet</Text>
                </View>
            ) : (
                <FlatList
                    data={displayedSessions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refresh}
                    refreshing={loading}
                />
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 },
    title: { fontSize: 22, fontWeight: '500', color: colors.light.textPrimary },
    searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
    searchInput: {
        backgroundColor: colors.light.buttonSecondary,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        ...typography.body,
        color: colors.light.textPrimary,
    },
    list: { paddingHorizontal: 24, paddingBottom: 24 },
    card: { paddingVertical: 16 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    date: { fontSize: 14, fontWeight: '600', color: colors.light.textPrimary },
    daysAgo: { fontSize: 12, color: colors.light.textTertiary },
    durationPill: { backgroundColor: colors.light.buttonSecondary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
    durationText: { fontSize: 11, color: colors.light.textSecondary },
    summary: { fontSize: 14, color: colors.light.textPrimary, lineHeight: 20, marginBottom: 12 },
    tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    tagPill: { backgroundColor: colors.light.buttonSecondary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    tagText: { fontSize: 12, color: colors.light.textSecondary },
    typeIndicator: { fontSize: 12 },
    separator: { height: 1, backgroundColor: colors.light.border },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
    loadingText: { ...typography.body, color: colors.light.textTertiary },
    errorText: { ...typography.body, color: colors.light.danger },
    retryText: { ...typography.bodySmall, color: colors.light.accent },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    emptyIllustration: { width: 80, height: 80, borderRadius: 16, backgroundColor: colors.light.buttonSecondary },
    emptyText: { ...typography.body, color: colors.light.textTertiary },
})