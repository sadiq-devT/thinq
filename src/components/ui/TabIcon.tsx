import React from 'react'
import { View, StyleSheet } from 'react-native'

interface TabIconProps {
    variant: 'home' | 'sessions' | 'patterns'
    color: string
    size?: number
}

export function TabIcon({ variant, color, size = 24 }: TabIconProps) {
    if (variant === 'home') {
        // Filled circle
        return (
            <View
                style={[
                    styles.iconCircle,
                    { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
                ]}
            />
        )
    }

    if (variant === 'sessions') {
        // Simple list icon - 3 horizontal lines
        return (
            <View style={[styles.iconList, { gap: size * 0.2 }]}>
                {[0, 1, 2].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.listLine,
                            {
                                backgroundColor: color,
                                width: size,
                                height: size * 0.15,
                                borderRadius: size * 0.075,
                            },
                        ]}
                    />
                ))}
            </View>
        )
    }

    if (variant === 'patterns') {
        // Wave/flow line
        return (
            <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <View
                    style={{
                        width: size * 0.8,
                        height: size * 0.12,
                        borderRadius: size * 0.06,
                        backgroundColor: color,
                    }}
                />
            </View>
        )
    }

    return null
}

const styles = StyleSheet.create({
    iconCircle: {},
    iconList: {
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    listLine: {},
})