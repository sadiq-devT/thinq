import React, { useState } from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { PageDots } from '@/components/ui/PageDots'
import { OnboardingButton } from '@/components/ui/OnboardingButton'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function OnboardingWelcome() {
    const router = useRouter()

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.dotsContainer}>
                <PageDots total={3} current={0} />
            </View>

            <View style={styles.content}>
                <View style={styles.decorativeCircle} />
                <Text style={styles.mainText}>A space to think.</Text>
                <Text style={styles.subText}>
                    Ask it anything. Say what's on your mind. It just listens and asks
                    better questions.
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <OnboardingButton
                    label="Let's start"
                    onPress={() => router.push('/onboarding/name')}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    dotsContainer: {
        paddingTop: 24,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 48,
    },
    decorativeCircle: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: colors.light.accent,
        opacity: 0.06,
        top: '20%',
    },
    mainText: {
        ...typography.heading1,
        color: colors.light.textPrimary,
        textAlign: 'center',
        marginBottom: 16,
    },
    subText: {
        ...typography.body,
        color: colors.light.textSecondary,
        textAlign: 'center',
        maxWidth: 280,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 48,
    },
})