import { supabase } from '@/lib/supabase'
import type { Session, Message } from '@/types'

export async function createSession(userId: string, durationMinutes: number): Promise<Session> {
    const { data, error } = await supabase
        .from('sessions')
        .insert({ user_id: userId, duration_minutes: durationMinutes })
        .select()
        .single()
    if (error) throw error
    return data
}

export async function addMessageToSession(sessionId: string, message: Message): Promise<void> {
    const { error } = await supabase
        .from('messages')
        .insert({ session_id: sessionId, role: message.role, content: message.content })
    if (error) throw error
}

export async function getSession(sessionId: string): Promise<Session | null> {
    const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
    if (!session) return null
    const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
    return { ...session, full_transcript: messages || [] } as Session
}

export async function getUserSessions(userId: string): Promise<Session[]> {
    const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    if (!sessions?.length) return []
    const sessionsWithMessages = await Promise.all(
        sessions.map(async (s) => {
            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('session_id', s.id)
                .order('created_at', { ascending: true })
            return { ...s, full_transcript: messages || [] }
        })
    )
    return sessionsWithMessages
}

export async function searchSessions(query: string): Promise<Session[]> {
    const { data } = await supabase
        .from('messages')
        .select('session_id')
        .textSearch('content', query)
    if (!data?.length) return []
    const sessionIds = [...new Set(data.map((m) => m.session_id))]
    return Promise.all(sessionIds.map((id) => getSession(id) as Promise<Session>))
}