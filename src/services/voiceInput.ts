import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'

export interface RecordingState {
    uri: string | null
    duration: number
    isRecording: boolean
}

const MAX_RECORDING_SECONDS = 120 // 2 minutes

export async function requestMicrophonePermission(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync()
    return status === 'granted'
}

export async function startRecording(
    onDurationUpdate?: (seconds: number) => void
): Promise<Audio.Recording | null> {
    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) return null

    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
    })

    const recording = new Audio.Recording()
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
    await recording.startAsync()

    return recording
}

export async function stopRecording(recording: Audio.Recording): Promise<string | null> {
    try {
        await recording.stopAndUnloadAsync()
        const uri = recording.getURI()
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        })
        return uri
    } catch (error) {
        console.error('stopRecording failed:', error)
        return null
    }
}

export async function transcribeAudio(fileUri: string): Promise<string> {
    if (!fileUri) throw new Error('No file URI provided')

    try {
        // Read file as base64
        const base64Data = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64' as const,
        })

        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/transcribe`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    audioBase64: base64Data,
                    filename: 'recording.m4a',
                }),
            }
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        return data.text || ''
    } catch (error) {
        console.error('transcribeAudio failed:', error)
        throw new Error('Failed to transcribe audio')
    }
}

export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
}