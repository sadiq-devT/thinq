import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface TimePickerProps {
    value: number
    onChange: (minutes: number) => void
    options?: number[]
}

export function TimePicker({ value, onChange, options = [3, 5, 10, 15, 20] }: TimePickerProps) {
    return (
        <View style={styles.container}>
            {options.map((minutes) => (
                <Text key={minutes} style={[styles.option, value === minutes && styles.selected]}>
                    {minutes} min
                </Text>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flexDirection: 'row', justifyContent: 'space-between' },
    option: { fontSize: 14, color: '#A0A0A0', padding: 8 },
    selected: { color: '#1A1A1A', fontWeight: '600' },
})