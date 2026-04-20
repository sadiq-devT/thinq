import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { createSession } from '@/services/supabase'
import type { User } from '@/types'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)

    const signIn = async () => {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        setUser(data.user as User)
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const startSession = async (durationMinutes: number) => {
        if (!user) throw new Error('Not authenticated')
        const session = await createSession(user.id, durationMinutes)
        return session
    }

    return { user, signIn, signOut, startSession }
}