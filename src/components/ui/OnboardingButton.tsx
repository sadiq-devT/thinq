import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

interface OnboardingButtonProps {
    label: string
    onPress: () => void
    disabled?: boolean
    loading?: boolean
    variant?: 'primary' | 'secondary'
    style?: ViewStyle
}

export function OnboardingButton({
    label,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    style,
}: OnboardingButtonProps) {
    const isPrimary = variant === 'primary'
    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
                disabled && styles.buttonDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color={isPrimary ? '#FFFFFF' : colors.light.textPrimary} />
            ) : (
                <Text
                    style={[
                        styles.label,
                        isPrimary ? styles.labelPrimary : styles.labelSecondary,
                        disabled && styles.labelDisabled,
                    ]}
                >
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    buttonPrimary: {
        backgroundColor: colors.light.accent,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.light.border,
    },
    buttonDisabled: {
        backgroundColor: colors.light.buttonPrimaryDisabled,
        borderColor: 'transparent',
    },
    label: {
        ...typography.button,
    },
    labelPrimary: {
        color: '#FFFFFF',
    },
    labelSecondary: {
        color: colors.light.textPrimary,
    },
    labelDisabled: {
        color: '#FFFFFF',
    },
})