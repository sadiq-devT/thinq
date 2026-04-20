import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/context/AuthContext'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'

export default function SignUpScreen() {
    const router = useRouter()
    const { signUp } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSignUp = async () => {
        setError(null)

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setLoading(true)
        try {
            await signUp(email, password)
            Alert.alert('Success', 'Account created! Check your email to confirm.', [
                { text: 'OK', onPress: () => router.back() },
            ])
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backText}>←</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Save your thinking</Text>
                    <Text style={styles.subtitle}>
                        Create an account so your sessions are never lost
                    </Text>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={colors.light.textTertiary}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor={colors.light.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSignUp}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Creating account…' : 'Create account'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
                        <Text style={styles.linkText}>Already have an account? Sign in</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    keyboardView: { flex: 1 },
    header: { paddingHorizontal: 20, paddingTop: 16 },
    backButton: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    backText: { fontSize: 24, color: colors.light.textSecondary },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
    title: { ...typography.heading1, color: colors.light.textPrimary, marginBottom: 8 },
    subtitle: { ...typography.body, color: colors.light.textSecondary, marginBottom: 40 },
    form: { gap: 12 },
    input: {
        backgroundColor: colors.light.surface,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        paddingHorizontal: 16,
        paddingVertical: 16,
        ...typography.body,
        color: colors.light.textPrimary,
    },
    errorText: { color: colors.light.danger, fontSize: 13, marginTop: 4 },
    button: {
        backgroundColor: colors.light.accent,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { ...typography.button, color: '#FFFFFF' },
    linkText: { ...typography.bodySmall, color: colors.light.textSecondary, textAlign: 'center', marginTop: 24 },
})