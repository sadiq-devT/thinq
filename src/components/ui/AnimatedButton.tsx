import React from 'react'
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TouchableOpacity } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated'

interface AnimatedButtonProps {
    label: string
    onPress: () => void
    variant?: 'primary' | 'secondary'
    loading?: boolean
    disabled?: boolean
    style?: ViewStyle
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export function AnimatedButton({ label, onPress, loading, disabled, style }: AnimatedButtonProps) {
    const scale = useSharedValue(1)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }))

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 })
    }

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    }

    return (
        <AnimatedTouchable
            style={[styles.button, disabled && styles.buttonDisabled, animatedStyle, style]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={1}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text style={styles.label}>{label}</Text>
            )}
        </AnimatedTouchable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#D0D0D0',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
})