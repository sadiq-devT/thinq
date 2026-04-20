import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { PageDots } from '@/components/ui/PageDots'
import { OnboardingButton } from '@/components/ui/OnboardingButton'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function OnboardingName() {
    const router = useRouter()
    const [name, setName] = useState('')

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <View style={styles.dotsContainer}>
                    <PageDots total={3} current={1} />
                </View>

                <View style={styles.content}>
                    <Text style={styles.question}>What should I call you?</Text>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Your name"
                            placeholderTextColor={colors.light.textTertiary}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={() => {
                                if (name.trim()) {
                                    router.push({ pathname: '/onboarding/topics', params: { name: name.trim() } })
                                }
                            }}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <OnboardingButton
                        label="Continue"
                        onPress={() => {
                            if (name.trim()) {
                                router.push({ pathname: '/onboarding/topics', params: { name: name.trim() } })
                            }
                        }}
                        disabled={!name.trim()}
                    />
                    <Text style={styles.privacyNote}>
                        Used only to personalise your sessions
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    keyboardView: {
        flex: 1,
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
    question: {
        ...typography.heading2,
        color: colors.light.textPrimary,
        textAlign: 'center',
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        alignItems: 'center',
    },
    input: {
        ...typography.heading2,
        color: colors.light.textPrimary,
        textAlign: 'center',
        height: 48,
        width: '100%',
        borderBottomWidth: 1.5,
        borderBottomColor: colors.light.border,
        paddingHorizontal: 16,
    },
    buttonContainer: {
        paddingHorizontal: 24,
        paddingBottom: 48,
        alignItems: 'center',
    },
    privacyNote: {
        ...typography.caption,
        color: colors.light.textTertiary,
        marginTop: 16,
    },
})