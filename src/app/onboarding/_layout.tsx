import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function OnboardingLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
                <Stack.Screen name="name" />
                <Stack.Screen name="topics" />
            </Stack>
        </>
    )
}