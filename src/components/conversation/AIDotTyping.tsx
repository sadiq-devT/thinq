import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
} from 'react-native-reanimated'
import { colors } from '@/theme/colors'

interface AIDotTypingProps {
    visible: boolean
}

export function AIDotTyping({ visible }: AIDotTypingProps) {
    const dot1Opacity = useSharedValue(0.3)
    const dot2Opacity = useSharedValue(0.3)
    const dot3Opacity = useSharedValue(0.3)

    useEffect(() => {
        if (!visible) {
            dot1Opacity.value = 0.3
            dot2Opacity.value = 0.3
            dot3Opacity.value = 0.3
            return
        }

        // Stagger loop: dot1=0ms, dot2=400ms, dot3=800ms. Each dot fades 0.3→1→0.3 over 800ms
        // Use setDelay to restart the loop every 1200ms
        dot1Opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 400, easing: Easing.ease }),
                withTiming(0.3, { duration: 400, easing: Easing.ease })
            ),
            -1,
            false
        )
        dot2Opacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 400 }),
                withTiming(1, { duration: 400, easing: Easing.ease }),
                withTiming(0.3, { duration: 400, easing: Easing.ease })
            ),
            -1,
            false
        )
        dot3Opacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 800 }),
                withTiming(1, { duration: 400, easing: Easing.ease }),
                withTiming(0.3, { duration: 400, easing: Easing.ease })
            ),
            -1,
            false
        )
    }, [visible])

    const dot1Style = useAnimatedStyle(() => ({ opacity: dot1Opacity.value }))
    const dot2Style = useAnimatedStyle(() => ({ opacity: dot2Opacity.value }))
    const dot3Style = useAnimatedStyle(() => ({ opacity: dot3Opacity.value }))

    if (!visible) return null

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
            <Animated.View style={[styles.dot, dot3Style]} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.light.accent,
    },
})