import React, { useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    cancelAnimation,
} from 'react-native-reanimated'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'
import { formatDuration } from '@/services/voiceInput'

interface VoiceButtonProps {
    isRecording: boolean
    recordingSeconds: number
    onPressIn: () => void
    onPressOut: () => void
}

export function VoiceButton({ isRecording, recordingSeconds, onPressIn, onPressOut }: VoiceButtonProps) {
    // Expanding ring animation
    const ringScale = useSharedValue(1)
    const ringOpacity = useSharedValue(1)

    useEffect(() => {
        if (isRecording) {
            ringScale.value = 1
            ringOpacity.value = 1
            ringScale.value = withRepeat(
                withSequence(
                    withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: 0 })
                ),
                -1,
                false
            )
            ringOpacity.value = withRepeat(
                withSequence(
                    withTiming(0, { duration: 1000, easing: Easing.out(Easing.ease) }),
                    withTiming(1, { duration: 0 })
                ),
                -1,
                false
            )
        } else {
            cancelAnimation(ringScale)
            cancelAnimation(ringOpacity)
            ringScale.value = withTiming(1, { duration: 150 })
            ringOpacity.value = withTiming(1, { duration: 150 })
        }
    }, [isRecording])

    const ringStyle = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale.value }],
        opacity: ringOpacity.value,
    }))

    return (
        <View style={styles.container}>
            {isRecording && (
                <View style={styles.recordingIndicator}>
                    <Animated.View style={[styles.ring, ringStyle]} />
                    <View style={styles.redDot} />
                    <Text style={styles.listeningText}>Listening…</Text>
                    <Text style={styles.durationText}>{formatDuration(recordingSeconds)}</Text>
                </View>
            )}
            <TouchableOpacity onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1}>
                <View style={[styles.button, isRecording ? styles.buttonRecording : styles.buttonIdle]}>
                    {isRecording ? (
                        <View style={styles.stopIcon} />
                    ) : (
                        <View style={styles.micIcon}>
                            <View style={styles.micHead} />
                            <View style={styles.micStand} />
                            <View style={styles.micBase} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', gap: 8 },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIdle: { backgroundColor: colors.light.accent },
    buttonRecording: { backgroundColor: colors.light.danger },
    micIcon: { alignItems: 'center' },
    micHead: { width: 8, height: 12, borderRadius: 4, backgroundColor: '#FFFFFF' },
    micStand: { width: 2, height: 4, backgroundColor: '#FFFFFF', marginTop: 1 },
    micBase: { width: 10, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF', marginTop: 1 },
    stopIcon: { width: 12, height: 12, borderRadius: 2, backgroundColor: '#FFFFFF' },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    ring: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: colors.light.danger,
        top: 0,
        left: 0,
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.light.danger,
    },
    listeningText: {
        ...typography.caption,
        color: colors.light.danger,
    },
    durationText: {
        ...typography.caption,
        color: colors.light.textTertiary,
    },
})