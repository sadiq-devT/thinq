import { View, Text, StyleSheet } from 'react-native'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

interface TopicPillProps {
    label: string
    selected: boolean
    onPress: () => void
}

export function TopicPill({ label, selected, onPress }: TopicPillProps) {
    return (
        <Text
            style={[
                styles.pill,
                selected ? styles.pillSelected : styles.pillUnselected,
            ]}
            onPress={onPress}
        >
            {label}
        </Text>
    )
}

const styles = StyleSheet.create({
    pill: {
        height: 44,
        borderRadius: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...typography.body,
    },
    pillUnselected: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.light.border,
        color: colors.light.textSecondary,
    },
    pillSelected: {
        backgroundColor: colors.light.accent,
        borderWidth: 1.5,
        borderColor: colors.light.accent,
        color: '#FFFFFF',
    },
})