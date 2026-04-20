import React from 'react'
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native'

interface ButtonProps {
    label: string
    onPress: () => void
    variant?: 'primary' | 'secondary'
    loading?: boolean
    disabled?: boolean
    style?: ViewStyle
}

export function Button({ label, onPress, loading, disabled, style }: ButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator color="#FFFFFF" />
            ) : (
                <Text style={styles.label}>{label}</Text>
            )}
        </TouchableOpacity>
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