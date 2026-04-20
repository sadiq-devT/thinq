import { supabase } from '@/lib/supabase'

export interface MemoryFact {
    key: string
    value: string
}

interface AIClientMessage {
    role: 'user' | 'assistant'
    content: string
}

export async function extractMemoriesFromSession(
    messages: AIClientMessage[],
    userId: string
): Promise<void> {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/extract-memory`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ messages }),
            }
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const memories: MemoryFact[] = data.memories || []

        if (memories.length === 0) return

        // Upsert each memory into user_memory table
        for (const memory of memories) {
            await supabase
                .from('user_memory')
                .upsert({
                    user_id: userId,
                    key: memory.key,
                    value: memory.value,
                    last_updated: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,key',
                })
        }
    } catch (error) {
        // Memory extraction is non-critical - silent failure
        console.error('extractMemoriesFromSession failed:', error)
    }
}

export async function getUserMemories(userId: string): Promise<MemoryFact[]> {
    const { data, error } = await supabase
        .from('user_memory')
        .select('key, value')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false })

    if (error) return []
    return (data || []).map((row: { key: string; value: string }) => ({
        key: row.key,
        value: row.value,
    }))
}

export async function updateUserMemory(
    userId: string,
    key: string,
    value: string
): Promise<void> {
    const { error } = await supabase
        .from('user_memory')
        .upsert({
            user_id: userId,
            key,
            value,
            last_updated: new Date().toISOString(),
        }, {
            onConflict: 'user_id,key',
        })

    if (error) throw error
}

export async function deleteUserMemory(userId: string, key: string): Promise<void> {
    const { error } = await supabase
        .from('user_memory')
        .delete()
        .eq('user_id', userId)
        .eq('key', key)

    if (error) throw error
}