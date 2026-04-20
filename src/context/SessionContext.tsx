import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    SessionState,
    SessionAction,
    SessionMessage,
    sessionReducer,
    initialSessionState,
    getTimeRemaining,
    getProgress,
    formatTimeRemaining,
} from './sessionMachine'

const SESSION_PAUSED_KEY = '@thinq/session_paused_at'
const MAX_PAUSE_MINUTES = 10

interface SessionContextValue {
    state: SessionState
    dispatch: React.Dispatch<SessionAction>
    // Helpers
    startSession: (minutes: number) => void
    sendMessage: (content: string) => void
    endSession: () => void
    resetSession: () => void
    pauseSession: () => void
    resumeSession: () => void
    // Computed
    timeRemaining: number
    progress: number
    progressPercent: number
    formattedTimeRemaining: string
    isComplete: boolean
    canSend: boolean
    isPaused: boolean
    wasBackgrounded: boolean
    clearBackgroundFlag: () => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(sessionReducer, initialSessionState)
    const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const [isPaused, setIsPaused] = useState(false)
    const [wasBackgrounded, setWasBackgrounded] = useState(false)
    const pausedAtRef = useRef<number | null>(null)

    // Timer: tick every second when active and not paused
    useEffect(() => {
        if (state.status === 'active' && !isPaused) {
            tickIntervalRef.current = setInterval(() => {
                dispatch({ type: 'TICK' })
            }, 1000)
        } else {
            if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current)
                tickIntervalRef.current = null
            }
        }
        return () => {
            if (tickIntervalRef.current) {
                clearInterval(tickIntervalRef.current)
            }
        }
    }, [state.status, isPaused])

    // Auto-end when time runs out
    useEffect(() => {
        if (state.status === 'active' && state.timeElapsedSeconds >= state.timeAvailableMinutes * 60) {
            dispatch({ type: 'END_SESSION' })
        }
    }, [state.timeElapsedSeconds, state.timeAvailableMinutes, state.status])

    // Handle app background/foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // App going to background — pause timer and save timestamp
                if (state.status === 'active') {
                    setIsPaused(true)
                    pausedAtRef.current = Date.now()
                    AsyncStorage.setItem(SESSION_PAUSED_KEY, JSON.stringify(pausedAtRef.current))
                }
            } else if (nextAppState === 'active') {
                // App coming back to foreground
                if (isPaused && pausedAtRef.current && state.status === 'active') {
                    const elapsedMinutes = (Date.now() - pausedAtRef.current) / 60000

                    if (elapsedMinutes >= MAX_PAUSE_MINUTES) {
                        // Auto-end session if more than 10 minutes passed
                        dispatch({ type: 'END_SESSION' })
                    } else {
                        // Resume session
                        setIsPaused(false)
                        setWasBackgrounded(true) // show "Continue?" prompt
                    }
                    pausedAtRef.current = null
                    AsyncStorage.removeItem(SESSION_PAUSED_KEY)
                }
            }
        }

        const subscription = AppState.addEventListener('change', handleAppStateChange)
        return () => subscription.remove()
    }, [isPaused, state.status])

    const startSession = useCallback((minutes: number) => {
        const sessionId = crypto.randomUUID()
        dispatch({
            type: 'START_SESSION',
            payload: {
                timeAvailableMinutes: minutes,
                sessionId,
                openingQuestion: "Let's start with what's on your mind. What's been occupying your thoughts lately?",
            },
        })
    }, [])

    const sendMessage = useCallback((content: string) => {
        if (!content.trim() || state.status !== 'active') return

        const userMessage: SessionMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
        }
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage })
    }, [state.status])

    const endSession = useCallback(() => {
        setIsPaused(false)
        pausedAtRef.current = null
        AsyncStorage.removeItem(SESSION_PAUSED_KEY)
        dispatch({ type: 'END_SESSION' })
    }, [])

    const resetSession = useCallback(() => {
        setIsPaused(false)
        setWasBackgrounded(false)
        pausedAtRef.current = null
        AsyncStorage.removeItem(SESSION_PAUSED_KEY)
        dispatch({ type: 'RESET_SESSION' })
    }, [])

    const pauseSession = useCallback(() => {
        setIsPaused(true)
        pausedAtRef.current = Date.now()
        AsyncStorage.setItem(SESSION_PAUSED_KEY, JSON.stringify(pausedAtRef.current))
    }, [])

    const resumeSession = useCallback(() => {
        setIsPaused(false)
        pausedAtRef.current = null
        AsyncStorage.removeItem(SESSION_PAUSED_KEY)
    }, [])

    const clearBackgroundFlag = useCallback(() => {
        setWasBackgrounded(false)
    }, [])

    const value: SessionContextValue = {
        state,
        dispatch,
        startSession,
        sendMessage,
        endSession,
        resetSession,
        pauseSession,
        resumeSession,
        timeRemaining: getTimeRemaining(state),
        progress: getProgress(state),
        progressPercent: Math.round(getProgress(state) * 100),
        formattedTimeRemaining: formatTimeRemaining(state),
        isComplete: state.status === 'complete' || state.status === 'ending',
        canSend: state.status === 'active' && !state.isAiTyping && !isPaused,
        isPaused,
        wasBackgrounded,
        clearBackgroundFlag,
    }

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

export function useSessionContext(): SessionContextValue {
    const ctx = useContext(SessionContext)
    if (!ctx) throw new Error('useSessionContext must be used within SessionProvider')
    return ctx
}

export function useSession() {
    return useSessionContext()
}