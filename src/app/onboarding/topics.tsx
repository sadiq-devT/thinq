import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function OnboardingTopics() {
    const router = useRouter()
    const { name } = useLocalSearchParams<{ name: string }>()
    const { user } = useAuth()
    const [selectedTopics, setSelectedTopics] = useState<string[]>([])
    const [loading, setLoading] = useState(false)

    const TOPICS = ['Work', 'Relationships', 'Decisions', 'Goals', 'Stress', 'Creativity', 'Money', 'Health', 'Purpose', 'Ideas']

    const toggleTopic = (topic: string) => {
        setSelectedTopics((prev) =>
            prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
        )
    }

    const handleComplete = async () => {
        if (!user) return
        setLoading(true)
        try {
            // Save name and topics to users table
            await supabase.from('users').upsert({
                id: user.id,
                display_name: name,
                onboarding_complete: true,
            })
            router.replace('/(tabs)')
        } catch (err) {
            console.error('Failed to save profile:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dotsContainer}>
                <View style={styles.dotsRow}>
                    {[0, 1, 2].map((i) => (
                        <View key={i} style={[styles.dot, i === 2 && styles.dotActive]} />
                    ))}
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.question}>What's usually on your mind?</Text>
                <Text style={styles.subtitle}>Pick anything that feels relevant.</Text>

                <View style={styles.topicsGrid}>
                    {TOPICS.map((topic) => (
                        <TouchableOpacity
                            key={topic}
                            style={[styles.topicPill, selectedTopics.includes(topic) && styles.topicPillSelected]}
                            onPress={() => toggleTopic(topic)}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.topicText, selectedTopics.includes(topic) && styles.topicTextSelected]}>
                                {topic}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, selectedTopics.length === 0 && styles.buttonDisabled]}
                    onPress={handleComplete}
                    disabled={selectedTopics.length === 0 || loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Setting up…' : 'Start thinking'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    dotsContainer: { paddingTop: 24, alignItems: 'center' },
    dotsRow: { flexDirection: 'row', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.light.border },
    dotActive: { width: 24, backgroundColor: colors.light.accent },
    content: { flex: 1, paddingTop: 48, paddingHorizontal: 24 },
    question: { ...typography.heading2, color: colors.light.textPrimary, textAlign: 'center', marginBottom: 8 },
    subtitle: { ...typography.bodySmall, color: colors.light.textSecondary, textAlign: 'center', marginBottom: 32 },
    topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
    topicPill: {
        height: 44,
        borderRadius: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.light.border,
    },
    topicPillSelected: { backgroundColor: colors.light.accent, borderColor: colors.light.accent },
    topicText: { ...typography.body, color: colors.light.textSecondary },
    topicTextSelected: { color: '#FFFFFF' },
    buttonContainer: { paddingHorizontal: 24, paddingBottom: 48 },
    button: { backgroundColor: colors.light.accent, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    buttonDisabled: { backgroundColor: colors.light.buttonPrimaryDisabled },
    buttonText: { ...typography.button, color: '#FFFFFF' },
})