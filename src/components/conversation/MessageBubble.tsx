import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
} from 'react-native-reanimated'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'
import type { Message } from '@/types'

interface MessageBubbleProps {
    message: Message
    isLast: boolean
}

export function MessageBubble({ message, isLast }: MessageBubbleProps) {
    const opacity = useSharedValue(0)
    const translateY = useSharedValue(8)

    useEffect(() => {
        if (isLast) {
            opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) })
            translateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.ease) })
        } else {
            opacity.value = 1
            translateY.value = 0
        }
    }, [isLast])

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }))

    const isUser = message.role === 'user'

    return (
        <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
            {!isUser && <View style={styles.aiDot} />}
            <Animated.View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble, animatedStyle]}>
                <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
                    {message.content}
                </Text>
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    assistantContainer: {
        justifyContent: 'flex-start',
    },
    aiDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.light.accent,
        marginRight: 10,
        marginBottom: 8,
    },
    bubble: {
        maxWidth: '80%',
    },
    userBubble: {
        backgroundColor: '#F2F1EE',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    assistantBubble: {},
    text: {
        ...typography.body,
    },
    userText: {
        color: colors.light.textPrimary,
    },
    assistantText: {
        color: colors.light.textPrimary,
    },
})