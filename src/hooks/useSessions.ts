import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchUserSessions, fetchSessionById, searchUserSessions as searchSessionsApi } from '@/services/sessionService'
import type { Session } from '@/types'

interface UseSessionsReturn {
    sessions: Session[]
    loading: boolean
    error: string | null
    refresh: () => Promise<void>
    search: (query: string) => Session[]
}

export function useSessions(): UseSessionsReturn {
    const { user } = useAuth()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        if (!user) {
            setSessions([])
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)
        try {
            const data = await fetchUserSessions(user.id)
            setSessions(data)
        } catch (err: any) {
            setError(err.message || 'Failed to load sessions')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        load()
    }, [load])

    const refresh = useCallback(async () => {
        await load()
    }, [load])

    const search = useCallback((query: string): Session[] => {
        if (!query.trim()) return sessions
        const lower = query.toLowerCase()
        return sessions.filter((s) => {
            const summaryText = s.summary_3_lines || ''
            const tags = s.tags || []
            return (
                summaryText.toLowerCase().includes(lower) ||
                tags.some((t: string) => t.toLowerCase().includes(lower))
            )
        })
    }, [sessions])

    return { sessions, loading, error, refresh, search }
}

// Hook for a single session
interface UseSessionReturn {
    session: Session | null
    loading: boolean
    error: string | null
}

export function useSession(sessionId: string): UseSessionReturn {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!sessionId) return

        const load = async () => {
            try {
                const data = await fetchSessionById(sessionId)
                setSession(data)
            } catch (err: any) {
                setError(err.message || 'Failed to load session')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [sessionId])

    return { session, loading, error }
}