import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'

interface PageDotsProps {
    total: number
    current: number
}

export function PageDots({ total, current }: PageDotsProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: total }).map((_, i) => (
                <View
                    key={i}
                    style={[
                        styles.dot,
                        i === current ? styles.dotActive : styles.dotInactive,
                    ]}
                />
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotActive: {
        backgroundColor: colors.light.accent,
        width: 24,
    },
    dotInactive: {
        backgroundColor: colors.light.border,
    },
})