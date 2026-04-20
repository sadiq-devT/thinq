import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'

interface SessionCardProps {
    date: string
    time: string
    summary: string
    duration: number
    onPress: () => void
}

export function SessionCard({ date, time, summary, duration, onPress }: SessionCardProps) {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <Text style={styles.dateTime}>{date} · {time}</Text>
                <View style={styles.durationPill}>
                    <Text style={styles.durationText}>{duration} min</Text>
                </View>
            </View>
            <Text style={styles.summary} numberOfLines={1} ellipsizeMode="tail">
                {summary}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.light.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dateTime: {
        fontSize: 12,
        color: colors.light.textTertiary,
    },
    durationPill: {
        backgroundColor: colors.light.buttonSecondary,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    durationText: {
        fontSize: 11,
        fontWeight: '500',
        color: colors.light.textSecondary,
    },
    summary: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.light.textPrimary,
        lineHeight: 20,
    },
})