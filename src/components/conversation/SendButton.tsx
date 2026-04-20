import React from 'react'
import { TouchableOpacity, View, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'

interface SendButtonProps {
    onPress: () => void
}

export function SendButton({ onPress }: SendButtonProps) {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.arrow} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.light.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderTopWidth: 5,
        borderBottomWidth: 5,
        borderLeftColor: '#FFFFFF',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginLeft: 2,
    },
})