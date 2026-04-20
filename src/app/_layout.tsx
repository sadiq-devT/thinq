import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { SessionProvider } from '@/context/SessionContext'
import { NetworkProvider } from '@/context/NetworkContext'
import { supabase } from '@/lib/supabase'

function AuthGate({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const [checked, setChecked] = useState(false)
    const [needsOnboarding, setNeedsOnboarding] = useState(false)

    useEffect(() => {
        if (loading) return

        if (!user) {
            setNeedsOnboarding(false)
            setChecked(true)
            return
        }

        // Check onboarding status
        supabase
            .from('users')
            .select('onboarding_complete')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                setNeedsOnboarding(!data?.onboarding_complete)
                setChecked(true)
            })
    }, [user, loading])

    if (!checked || loading) return null

    return <>{children}</>
}

function RootStack() {
    const { user, loading } = useAuth()

    if (loading) return null

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {user ? (
                <>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="session/[id]" options={{ presentation: 'card' }} />
                    <Stack.Screen name="session/end" options={{ presentation: 'card' }} />
                    <Stack.Screen name="session/session-detail" options={{ presentation: 'card' }} />
                    <Stack.Screen name="settings" options={{ presentation: 'card' }} />
                </>
            ) : (
                <>
                    <Stack.Screen name="onboarding/welcome" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="onboarding/name" />
                    <Stack.Screen name="onboarding/topics" />
                    <Stack.Screen name="auth/sign-up" />
                    <Stack.Screen name="auth/sign-in" />
                </>
            )}
        </Stack>
    )
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <NetworkProvider>
                <SessionProvider>
                    <StatusBar style="dark" />
                    <AuthGate>
                        <RootStack />
                    </AuthGate>
                </SessionProvider>
            </NetworkProvider>
        </AuthProvider>
    )
}