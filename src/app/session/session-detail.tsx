import React from 'react'
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'
import type { Message } from '@/types'

const SESSION_DATA = {
    date: 'Mar 18',
    time: '2:30 PM',
    duration: 12,
    summary: 'You talked about work pressure and a decision you\'ve been avoiding. Something important: you mentioned the real issue might be fear of being wrong. One thread to revisit: the conversation with your manager next week.',
    tags: ['work', 'decisions', 'career'],
}

const SESSION_MESSAGES: Message[] = [
    { id: '1', role: 'assistant', content: "Let's start with what's on your mind. What's been occupying your thoughts lately?", created_at: new Date().toISOString() },
    { id: '2', role: 'user', content: "I've been thinking about my career a lot lately. I feel stuck.", created_at: new Date().toISOString() },
    { id: '3', role: 'assistant', content: "That sense of being stuck can be really heavy. When you think about your career right now, what's the part that feels most stuck?", created_at: new Date().toISOString() },
    { id: '4', role: 'user', content: "I think it's that I don't know if I'm on the right path. I look at where I am and wonder if this is really what I want.", created_at: new Date().toISOString() },
    { id: '5', role: 'assistant', content: "That's a really honest answer. So the question isn't just about the job — it's more about whether the path you're on still feels true to you. When you imagine the version of your work life that would feel right, what would it look like?", created_at: new Date().toISOString() },
    { id: '6', role: 'user', content: "Honestly? More autonomy. More meaning. I want to feel like what I do actually matters.", created_at: new Date().toISOString() },
    { id: '7', role: 'assistant', content: "Autonomy and meaning — those feel like the real drivers here. If you didn't have to worry about practicality for a moment, what would the ideal version of your work look like?", created_at: new Date().toISOString() },
    { id: '8', role: 'user', content: "I'd be doing something creative that helps people. Something where I get to make decisions and own the outcomes.", created_at: new Date().toISOString() },
    { id: '9', role: 'assistant', content: "That's a clear picture. So the gap between where you are now and that ideal involves creativity, impact, and ownership. Which one feels most urgent to address first?", created_at: new Date().toISOString() },
]

export default function SessionDetailScreen() {
    const router = useRouter()

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{SESSION_DATA.date}, {SESSION_DATA.time}</Text>
                    <Text style={styles.headerSubtitle}>{SESSION_DATA.duration} minute session</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>WHAT CAME UP</Text>
                    <Text style={styles.summaryText}>{SESSION_DATA.summary}</Text>
                </View>

                {/* Full Conversation */}
                <View style={styles.conversationSection}>
                    <Text style={styles.sectionLabel}>FULL CONVERSATION</Text>
                    <View style={styles.conversationList}>
                        {SESSION_MESSAGES.map((message) => {
                            const isUser = message.role === 'user'
                            return (
                                <View key={message.id} style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
                                    {!isUser && <View style={styles.aiDot} />}
                                    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                                        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                                            {message.content}
                                        </Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </View>

                {/* Tags */}
                <View style={styles.tagsSection}>
                    <View style={styles.tagsRow}>
                        {SESSION_DATA.tags.map((tag) => (
                            <View key={tag} style={styles.tagPill}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    backText: { fontSize: 24, color: colors.light.textSecondary },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: '600', color: colors.light.textPrimary },
    headerSubtitle: { fontSize: 13, color: colors.light.textSecondary, marginTop: 2 },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    summaryCard: {
        backgroundColor: colors.light.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 28,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.light.textTertiary,
        letterSpacing: 1,
        marginBottom: 10,
    },
    summaryText: {
        ...typography.bodySmall,
        color: colors.light.textSecondary,
        lineHeight: 22,
    },
    conversationSection: { marginBottom: 28 },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.light.textTertiary,
        letterSpacing: 1,
        marginBottom: 20,
    },
    conversationList: { gap: 20 },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    userRow: { justifyContent: 'flex-end' },
    assistantRow: { justifyContent: 'flex-start' },
    aiDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.light.accent,
        marginRight: 10,
        marginBottom: 8,
    },
    bubble: { maxWidth: '80%' },
    userBubble: {
        backgroundColor: '#F2F1EE',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    assistantBubble: {},
    messageText: { ...typography.body },
    userText: { color: colors.light.textPrimary },
    assistantText: { color: colors.light.textPrimary },
    tagsSection: { paddingTop: 8, paddingBottom: 16 },
    tagsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    tagPill: {
        backgroundColor: colors.light.buttonSecondary,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    tagText: { fontSize: 13, color: colors.light.textSecondary },
})