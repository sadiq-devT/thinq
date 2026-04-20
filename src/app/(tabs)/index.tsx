import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated'
import { TimePill } from '@/components/ui/TimePill'
import { SessionCard } from '@/components/ui/SessionCard'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

const TIME_OPTIONS = [5, 10, 15, 20, 30]

const PLACEHOLDER_SESSIONS = [
    { id: '1', date: 'Today', time: '2:30 PM', summary: 'Struggling with a decision about whether to take on a new project at work', duration: 12 },
    { id: '2', date: 'Yesterday', time: '9:15 AM', summary: 'Thinking through my goals for the quarter and what really matters', duration: 20 },
    { id: '3', date: 'Mar 14', time: '6:45 PM', summary: 'Processing some feelings about a friendship that has been weighing on me', duration: 8 },
]

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

function AnimatedStartButton({ onPress }: { onPress: () => void }) {
    const scale = useSharedValue(1)
    const opacity = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }))

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 })
    }

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    }

    return (
        <AnimatedTouchable
            style={[styles.startButton, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Text style={styles.startButtonText}>Start thinking →</Text>
        </AnimatedTouchable>
    )
}

export default function HomeScreen() {
    const router = useRouter()
    const [selectedMinutes, setSelectedMinutes] = useState(10)

    const handleStartSession = () => {
        router.push(`/session/new?duration=${selectedMinutes}`)
    }

    const handleSessionPress = (sessionId: string) => {
        router.push(`/session/${sessionId}`)
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Top bar */}
                <View style={styles.topBar}>
                    <Text style={styles.greeting}>
                        Good {getGreeting()}, Yasir
                    </Text>
                    <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>Y</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Start Card */}
                <View style={styles.startCard}>
                    <Text style={styles.startCardLabel}>How much time do you have?</Text>
                    <View style={styles.timePills}>
                        {TIME_OPTIONS.map((minutes) => (
                            <TimePill
                                key={minutes}
                                minutes={minutes}
                                selected={selectedMinutes === minutes}
                                onPress={() => setSelectedMinutes(minutes)}
                            />
                        ))}
                    </View>
                    <AnimatedStartButton onPress={handleStartSession} />
                </View>

                {/* Recent Sessions */}
                <View style={styles.sessionsHeader}>
                    <Text style={styles.sectionLabel}>RECENT SESSIONS</Text>
                </View>

                <FlatList
                    data={PLACEHOLDER_SESSIONS}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <SessionCard
                            date={item.date}
                            time={item.time}
                            summary={item.summary}
                            duration={item.duration}
                            onPress={() => handleSessionPress(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.sessionsList}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 24,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '500',
        color: colors.light.textPrimary,
    },
    settingsButton: { padding: 4 },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.light.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    startCard: {
        backgroundColor: colors.light.surface,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
    },
    startCardLabel: {
        ...typography.bodySmall,
        color: colors.light.textSecondary,
        marginBottom: 16,
    },
    timePills: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    startButton: {
        backgroundColor: colors.light.accent,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        ...typography.button,
        color: '#FFFFFF',
    },
    sessionsHeader: {
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.light.textTertiary,
        letterSpacing: 1,
    },
    sessionsList: {
        paddingBottom: 24,
    },
})