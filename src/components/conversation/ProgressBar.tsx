import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'

interface ProgressBarProps {
    elapsed: number // minutes
    total: number // minutes
}

export function ProgressBar({ elapsed, total }: ProgressBarProps) {
    const progress = Math.min(elapsed / total, 1)

    return (
        <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        height: 3,
        backgroundColor: colors.light.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: colors.light.accent,
        borderRadius: 2,
    },
})