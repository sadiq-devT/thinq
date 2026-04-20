import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { colors } from '@/theme/colors'
import { typography } from '@/theme/typography'
import { MessageBubble } from '@/components/conversation/MessageBubble'
import { AIDotTyping } from '@/components/conversation/AIDotTyping'
import { VoiceButton } from '@/components/conversation/VoiceButton'
import { SendButton } from '@/components/conversation/SendButton'
import { ProgressBar } from '@/components/conversation/ProgressBar'
import { useSession } from '@/context'
import { useAuth } from '@/context/AuthContext'
import { useNetwork } from '@/context/NetworkContext'
import { getAIResponse, generateOpeningQuestion } from '@/services/claudeAI'
import { getTimeOfDay } from '@/services/mockAI'
import { startRecording, stopRecording, transcribeAudio } from '@/services/voiceInput'
import { getMemoryString, extractAndSaveMemory } from '@/services/memory'
import { runPatternDetectionIfDue } from '@/services/patterns'
import { getOfflineQuestion } from '@/services/offlineQuestions'
import { saveSessionLocally } from '@/services/sessionService'
import type { SessionMessage } from '@/context'

const MAX_RECORDING_SECONDS = 120
const AUTO_SEND_DELAY_MS = 2000

export default function SessionScreen() {
    const { duration } = useLocalSearchParams<{ duration?: string }>()
    const router = useRouter()
    const flatListRef = useRef<FlatList>(null)
    const recordingRef = useRef<any>(null)
    const autoSendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const offlineQuestionIndexRef = useRef(0)

    const [input, setInput] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [recordingSeconds, setRecordingSeconds] = useState(0)
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
    const [userMemory, setUserMemory] = useState<string>('')
    const [isOffline, setIsOffline] = useState(false)
    const [offlineBannerVisible, setOfflineBannerVisible] = useState(false)
    const [localSaveIndicator, setLocalSaveIndicator] = useState(false)
    const [continuePromptVisible, setContinuePromptVisible] = useState(false)
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

    const { user } = useAuth()
    const { isConnected } = useNetwork()
    const {
        state,
        dispatch,
        startSession,
        formattedTimeRemaining,
        isPaused,
        wasBackgrounded,
        clearBackgroundFlag,
        resumeSession,
        endSession,
    } = useSession()

    const totalMinutes = Number(duration) || 10

    // Monitor connectivity
    useEffect(() => {
        if (!isConnected && !isOffline) {
            setIsOffline(true)
            setOfflineBannerVisible(true)
            setTimeout(() => setOfflineBannerVisible(false), 4000)
        } else if (isConnected) {
            setIsOffline(false)
        }
    }, [isConnected])

    // Handle background resume prompt
    useEffect(() => {
        if (wasBackgrounded) {
            setContinuePromptVisible(true)
        }
    }, [wasBackgrounded])

    // Load user memory and start session on mount
    useEffect(() => {
        const init = async () => {
            if (state.status === 'idle' && duration && user) {
                const memoryStr = await getMemoryString(user.id)
                setUserMemory(memoryStr)
                setSessionStartTime(Date.now())

                startSession(totalMinutes)

                if (isConnected) {
                    const timeOfDay = getTimeOfDay()
                    const openingQuestion = await generateOpeningQuestion(
                        totalMinutes,
                        timeOfDay,
                        [],
                        null
                    )
                    const openingMessage: SessionMessage = {
                        id: 'opening',
                        role: 'ai',
                        content: openingQuestion,
                        timestamp: Date.now(),
                    }
                    dispatch({ type: 'ADD_MESSAGE', payload: openingMessage })
                } else {
                    const offlineQ = getOfflineQuestion(offlineQuestionIndexRef.current)
                    offlineQuestionIndexRef.current += 1
                    const openingMessage: SessionMessage = {
                        id: 'opening',
                        role: 'ai',
                        content: offlineQ,
                        timestamp: Date.now(),
                    }
                    dispatch({ type: 'ADD_MESSAGE', payload: openingMessage })
                }
            }
        }
        init()
    }, [duration, state.status, user, startSession, dispatch, isConnected])

    // Navigate to end screen when session ends
    useEffect(() => {
        if (state.status === 'ending') {
            if (user && state.messages.length > 0) {
                const transcript = state.messages.map((m) => ({
                    role: (m.role === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
                    content: m.content,
                }))

                // Attempt online save, fallback to local
                if (isConnected) {
                    extractAndSaveMemory(user.id, transcript).finally(() => {
                        runPatternDetectionIfDue(user.id)
                    })
                }

                // Always save to AsyncStorage as backup
                saveSessionLocally({
                    userId: user.id,
                    sessionId: state.sessionId || `local-${Date.now()}`,
                    startedAt: new Date(sessionStartTime || Date.now() - totalMinutes * 60000),
                    endedAt: new Date(),
                    durationMinutes: totalMinutes,
                    sessionType: 'text',
                    timeAvailableMinutes: totalMinutes,
                    openingQuestion: state.openingQuestion,
                    messages: transcript,
                }).then(() => {
                    setLocalSaveIndicator(true)
                    setTimeout(() => setLocalSaveIndicator(false), 3000)
                })
            }
            router.replace('/session/end')
        }
    }, [state.status, router, user, state.messages, isConnected, sessionStartTime, totalMinutes, state.sessionId, state.openingQuestion])

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        }
    }, [])

    const handleContinue = useCallback(() => {
        setContinuePromptVisible(false)
        clearBackgroundFlag()
        resumeSession()
    }, [clearBackgroundFlag, resumeSession])

    const handleEndEarly = useCallback(() => {
        setContinuePromptVisible(false)
        clearBackgroundFlag()
        endSession()
    }, [clearBackgroundFlag, endSession])

    const handleSend = useCallback(async () => {
        if (!input.trim() || state.isAiTyping || isPaused) return

        const userText = input.trim()
        setInput('')

        const userMessage: SessionMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: userText,
            timestamp: Date.now(),
        }
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage })

        dispatch({ type: 'SET_AI_TYPING', payload: true })

        try {
            const context = {
                timeAvailable: state.timeAvailableMinutes,
                timeElapsed: Math.floor(state.timeElapsedSeconds / 60),
                userName: (user as any)?.display_name || null,
                userTopics: [],
                userMemory: userMemory ? [userMemory] : [],
                messageCount: state.messages.length,
            }

            const conversationForApi = state.messages
                .filter((m) => m.id !== 'opening')
                .map((m) => ({
                    role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
                    content: m.content,
                }))
                .concat([{ role: 'user' as const, content: userText }])

            let aiResponse: string
            if (isOffline || !isConnected) {
                aiResponse = getOfflineQuestion(offlineQuestionIndexRef.current)
                offlineQuestionIndexRef.current += 1
            } else {
                aiResponse = await getAIResponse(context, conversationForApi)
            }

            const aiMessage: SessionMessage = {
                id: `ai-${Date.now()}`,
                role: 'ai',
                content: aiResponse,
                timestamp: Date.now(),
            }
            dispatch({ type: 'ADD_MESSAGE', payload: aiMessage })
        } catch (err) {
            // Fall back to offline question bank on error
            const fallback = getOfflineQuestion(offlineQuestionIndexRef.current)
            offlineQuestionIndexRef.current += 1
            const aiMessage: SessionMessage = {
                id: `ai-${Date.now()}`,
                role: 'ai',
                content: fallback,
                timestamp: Date.now(),
            }
            dispatch({ type: 'ADD_MESSAGE', payload: aiMessage })
        } finally {
            dispatch({ type: 'SET_AI_TYPING', payload: false })
        }
    }, [input, state.isAiTyping, state.messages, state.timeAvailableMinutes, state.timeElapsedSeconds, user, userMemory, dispatch, isPaused, isOffline, isConnected])

    const handleVoicePress = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        setTranscriptionError(null)

        if (recordingRef.current) {
            await stopRecording(recordingRef.current)
            recordingRef.current = null
        }

        const recording = await startRecording()
        if (!recording) {
            Alert.alert('Permission needed', 'Microphone access is required for voice input.')
            return
        }

        recordingRef.current = recording
        setIsRecording(true)
        setRecordingSeconds(0)

        recordingTimerRef.current = setInterval(() => {
            setRecordingSeconds((prev) => {
                if (prev >= MAX_RECORDING_SECONDS - 1) {
                    handleVoiceRelease()
                    return prev
                }
                return prev + 1
            })
        }, 1000)
    }, [])

    const handleVoiceRelease = useCallback(async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current)
            recordingTimerRef.current = null
        }

        const recording = recordingRef.current
        recordingRef.current = null
        setIsRecording(false)

        if (!recording) return

        const uri = await stopRecording(recording)
        if (!uri) return

        setIsTranscribing(true)
        setTranscriptionError(null)

        try {
            const transcript = await transcribeAudio(uri)
            setInput(transcript)

            autoSendTimerRef.current = setTimeout(() => {
                if (input === transcript) {
                    handleSend()
                }
            }, AUTO_SEND_DELAY_MS)
        } catch (err) {
            setTranscriptionError("Didn't catch that — try again")
        } finally {
            setIsTranscribing(false)
        }
    }, [input, handleSend])

    const handleClose = () => {
        Alert.alert(
            'End session early?',
            'Your progress will be saved.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'End session', onPress: () => endSession() },
            ]
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            {/* Continue session prompt */}
            {continuePromptVisible && (
                <View style={styles.continuePrompt}>
                    <Text style={styles.continueText}>Continue your session?</Text>
                    <View style={styles.continueButtons}>
                        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                            <Text style={styles.continueButtonText}>Continue</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.endEarlyButton} onPress={handleEndEarly}>
                            <Text style={styles.endEarlyText}>End</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
                <View style={styles.progressContainer}>
                    <ProgressBar
                        elapsed={state.timeElapsedSeconds / 60}
                        total={totalMinutes}
                    />
                </View>
                <Text style={styles.timeLeft}>{formattedTimeRemaining}</Text>
            </View>

            {/* Offline banner */}
            {offlineBannerVisible && (
                <View style={styles.offlineBanner}>
                    <Text style={styles.offlineBannerText}>
                        You're offline — session will use a simplified mode
                    </Text>
                </View>
            )}

            {/* Offline indicator (subtle, persistent) */}
            {isOffline && !offlineBannerVisible && (
                <View style={styles.offlineIndicator}>
                    <View style={styles.offlineDot} />
                    <Text style={styles.offlineIndicatorText}>offline</Text>
                </View>
            )}

            {/* Local save indicator */}
            {localSaveIndicator && (
                <View style={styles.localSaveIndicator}>
                    <Text style={styles.localSaveText}>Saved locally</Text>
                </View>
            )}

            <FlatList
                ref={flatListRef}
                data={state.messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <MessageBubble
                        message={item}
                        isLast={index === state.messages.length - 1}
                    />
                )}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                showsVerticalScrollIndicator={false}
            />

            {state.isAiTyping && <AIDotTyping visible={state.isAiTyping} />}

            {transcriptionError && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{transcriptionError}</Text>
                    <TouchableOpacity onPress={() => setTranscriptionError(null)}>
                        <Text style={styles.dismissText}>×</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.inputArea}>
                {isTranscribing && (
                    <View style={styles.transcribingIndicator}>
                        <Text style={styles.transcribingText}>Transcribing…</Text>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type or speak…"
                        placeholderTextColor={colors.light.textTertiary}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={500}
                        textAlignVertical="center"
                        editable={!state.isAiTyping && !isTranscribing && !isPaused}
                    />
                    <VoiceButton
                        isRecording={isRecording}
                        recordingSeconds={recordingSeconds}
                        onPressIn={handleVoicePress}
                        onPressOut={handleVoiceRelease}
                    />
                    {input.trim().length > 0 && !state.isAiTyping && !isRecording && !isPaused && (
                        <SendButton onPress={handleSend} />
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    closeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    closeText: { fontSize: 28, color: colors.light.textTertiary, lineHeight: 30 },
    progressContainer: { flex: 1, marginHorizontal: 12 },
    timeLeft: { ...typography.caption, color: colors.light.textSecondary, minWidth: 60, textAlign: 'right' },
    messagesList: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 12,
    },
    errorText: { ...typography.caption, color: colors.light.danger },
    dismissText: { fontSize: 18, color: colors.light.danger },
    inputArea: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, backgroundColor: colors.light.background },
    transcribingIndicator: { alignItems: 'center', paddingBottom: 8 },
    transcribingText: { ...typography.caption, color: colors.light.textTertiary },
    inputContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
    textInput: {
        flex: 1,
        minHeight: 48,
        maxHeight: 120,
        backgroundColor: colors.light.surface,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.light.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        ...typography.body,
        color: colors.light.textPrimary,
    },
    offlineBanner: {
        backgroundColor: colors.light.accent || '#7C6FCD',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: 'center',
    },
    offlineBannerText: { ...typography.caption, color: '#FFFFFF', fontWeight: '500' },
    offlineIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        gap: 6,
    },
    offlineDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.light.accent || '#7C6FCD',
    },
    offlineIndicatorText: { ...typography.caption, color: colors.light.textTertiary, fontSize: 11 },
    localSaveIndicator: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    localSaveText: { ...typography.caption, color: colors.light.success, fontSize: 11 },
    continuePrompt: {
        position: 'absolute',
        top: 80,
        left: 20,
        right: 20,
        backgroundColor: colors.light.surface,
        borderRadius: 16,
        padding: 20,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    continueText: { ...typography.body, color: colors.light.textPrimary, textAlign: 'center', marginBottom: 16 },
    continueButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
    continueButton: {
        backgroundColor: colors.light.accent,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    continueButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
    endEarlyButton: { paddingHorizontal: 16, paddingVertical: 10 },
    endEarlyText: { ...typography.body, color: colors.light.textTertiary },
})