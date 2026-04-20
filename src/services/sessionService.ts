import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import type { Session, Message } from '@/types'
import { getMockSummary } from './mockAI'

const PENDING_SESSIONS_KEY = '@thinq/pending_sessions'

export interface SessionSummary {
    line1: string
    line2: string
    line3: string
    tags: string[]
}

export interface SaveSessionParams {
    userId: string
    sessionId: string
    startedAt: Date
    endedAt: Date
    durationMinutes: number
    sessionType: 'text' | 'voice'
    timeAvailableMinutes: number
    openingQuestion: string
    messages: Message[]
}

export async function saveSessionToSupabase(params: SaveSessionParams): Promise<Session> {
    const { userId, sessionId, startedAt, endedAt, durationMinutes, sessionType, timeAvailableMinutes, openingQuestion, messages } = params

    const summary = getMockSummary(messages)

    const { data, error } = await supabase
        .from('sessions')
        .insert({
            id: sessionId,
            user_id: userId,
            started_at: startedAt.toISOString(),
            ended_at: endedAt.toISOString(),
            duration_minutes: Math.round(durationMinutes),
            session_type: sessionType,
            time_available_minutes: timeAvailableMinutes,
            opening_question: openingQuestion,
            full_transcript: messages,
            summary_3_lines: [summary.line1, summary.line2, summary.line3].join('\n'),
            tags: summary.tags,
        })
        .select()
        .single()

    if (error) throw error
    return data as Session
}

export async function saveSessionLocally(params: SaveSessionParams): Promise<void> {
    const pending = await AsyncStorage.getItem(PENDING_SESSIONS_KEY)
    const pendingSessions = pending ? JSON.parse(pending) : []
    pendingSessions.push({ ...params, savedAt: new Date().toISOString() })
    await AsyncStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(pendingSessions))
}

export async function getPendingSessions(): Promise<SaveSessionParams[]> {
    const pending = await AsyncStorage.getItem(PENDING_SESSIONS_KEY)
    return pending ? JSON.parse(pending) : []
}

export async function clearPendingSession(index: number): Promise<void> {
    const pending = await AsyncStorage.getItem(PENDING_SESSIONS_KEY)
    if (!pending) return
    const sessions = JSON.parse(pending)
    sessions.splice(index, 1)
    await AsyncStorage.setItem(PENDING_SESSIONS_KEY, JSON.stringify(sessions))
}

export async function retryPendingSessions(): Promise<void> {
    const pending = await getPendingSessions()
    for (let i = pending.length - 1; i >= 0; i--) {
        try {
            await saveSessionToSupabase(pending[i])
            await clearPendingSession(i)
        } catch (err) {
            console.error('Retry failed for session:', pending[i].sessionId)
            break
        }
    }
}

export async function fetchUserSessions(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })

    if (error) throw error
    return (data || []) as Session[]
}

export async function fetchSessionById(sessionId: string): Promise<Session | null> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }
    return data as Session
}

export async function searchUserSessions(userId: string, query: string): Promise<Session[]> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .or(`summary_3_lines.ilike.%${query}%,tags.cs.{${query}}`)
        .order('started_at', { ascending: false })

    if (error) throw error
    return (data || []) as Session[]
}