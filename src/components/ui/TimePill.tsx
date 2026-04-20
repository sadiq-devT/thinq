import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'

interface TimePillProps {
    minutes: number
    selected: boolean
    onPress: () => void
}

export function TimePill({ minutes, selected, onPress }: TimePillProps) {
    return (
        <TouchableOpacity
            style={[styles.pill, selected && styles.pillSelected]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {minutes} min
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    pill: {
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.light.surface,
        borderWidth: 1.5,
        borderColor: colors.light.border,
    },
    pillSelected: {
        backgroundColor: colors.light.accent,
        borderColor: colors.light.accent,
    },
    pillText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.light.textSecondary,
    },
    pillTextSelected: {
        color: '#FFFFFF',
    },
})