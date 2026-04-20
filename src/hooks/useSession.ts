import { useState, useEffect, useCallback } from 'react'
import { getSession, addMessageToSession } from '@/services/supabase'
import type { Session, Message } from '@/types'

export function useSession(sessionId: string | undefined) {
    const [session, setSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchSession = useCallback(async () => {
        if (!sessionId) return
        setIsLoading(true)
        try {
            const data = await getSession(sessionId)
            setSession(data)
        } finally {
            setIsLoading(false)
        }
    }, [sessionId])

    useEffect(() => {
        fetchSession()
    }, [fetchSession])

    const addMessage = async (message: Message) => {
        if (!sessionId) return
        await addMessageToSession(sessionId, message)
        setSession((prev) =>
            prev ? { ...prev, full_transcript: [...(prev.full_transcript || []), message] } : prev
        )
    }

    return { session, addMessage, isLoading, refetch: fetchSession }
}