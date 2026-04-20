import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    Layout,
} from 'react-native-reanimated'
import { useRouter, usePathname } from 'expo-router'
import { TabIcon } from '@/components/ui/TabIcon'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

const TAB_ITEMS = [
    { name: 'index', label: 'Home', icon: 'home' as const },
    { name: 'sessions', label: 'Sessions', icon: 'sessions' as const },
    { name: 'patterns', label: 'Patterns', icon: 'patterns' as const },
]

function AnimatedTabItem({
    label,
    icon,
    isActive,
    onPress,
}: {
    label: string
    icon: 'home' | 'sessions' | 'patterns'
    isActive: boolean
    onPress: () => void
}) {
    const scale = useSharedValue(isActive ? 1 : 0.85)

    React.useEffect(() => {
        scale.value = withSpring(isActive ? 1 : 0.85, { damping: 18, stiffness: 350 })
    }, [isActive])

    const textStyle = useAnimatedStyle(() => ({
        opacity: withSpring(isActive ? 1 : 0.6, { damping: 20 }),
    }))

    return (
        <TouchableOpacity onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
            <TabIcon variant={icon} color={isActive ? colors.light.accent : colors.light.textTertiary} size={22} />
            <Animated.Text style={[styles.tabLabel, textStyle, isActive && styles.tabLabelActive]}>
                {label}
            </Animated.Text>
            {isActive && (
                <Animated.View
                    layout={Layout.springify().damping(18).stiffness(350)}
                    style={styles.activeDot}
                />
            )}
        </TouchableOpacity>
    )
}

export default function TabLayout() {
    const router = useRouter()
    const pathname = usePathname()

    const activeTab = pathname === '/' ? 'index' : pathname.split('/')[2] || 'index'

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {TAB_ITEMS.map((tab) => (
                    <AnimatedTabItem
                        key={tab.name}
                        label={tab.label}
                        icon={tab.icon}
                        isActive={activeTab === tab.name}
                        onPress={() => router.push(`/${tab.name === 'index' ? '' : tab.name}`)}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.light.surface,
        borderTopColor: colors.light.border,
        borderTopWidth: 1,
        height: 80,
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    tabLabel: {
        ...typography.tabLabel,
        marginTop: 4,
        color: colors.light.textTertiary,
    },
    tabLabelActive: {
        color: colors.light.accent,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.light.accent,
        marginTop: 4,
    },
})