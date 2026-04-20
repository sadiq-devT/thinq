import { supabase } from '@/lib/supabase'
import { getUserMemories, type MemoryFact } from './memoryService'

/**
 * Format user memories as a readable string for injection into AI system prompt.
 * Example output: "Their manager is called Sarah. Working on a product launch. Frequently feels behind on deadlines."
 */
export function formatMemoryForPrompt(memories: MemoryFact[]): string {
    if (memories.length === 0) return ''
    return memories.map((m) => m.value).join('. ') + '.'
}

/**
 * Get all user memories formatted as a string ready for the AI system prompt.
 * Returns empty string if no memories exist.
 */
export async function getMemoryString(userId: string): Promise<string> {
    const memories = await getUserMemories(userId)
    return formatMemoryForPrompt(memories)
}

/**
 * Extract memory facts from a session transcript and save to user_memory table.
 * Calls the extract-memory Edge Function, then upserts each result.
 */
export async function extractAndSaveMemory(
    userId: string,
    transcript: { role: 'user' | 'assistant'; content: string }[]
): Promise<MemoryFact[]> {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/extract-memory`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ messages: transcript }),
            }
        )

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const data = await response.json()
        const memories: MemoryFact[] = data.memories || []

        if (memories.length === 0) return []

        // Upsert each memory into user_memory table
        for (const memory of memories) {
            const { error } = await supabase
                .from('user_memory')
                .upsert(
                    {
                        user_id: userId,
                        key: memory.key,
                        value: memory.value,
                        last_updated: new Date().toISOString(),
                    },
                    { onConflict: 'user_id,key' }
                )

            if (error) console.error(`Failed to upsert memory ${memory.key}:`, error)
        }

        return memories
    } catch (error) {
        // Memory extraction is non-critical — silent failure
        console.error('extractAndSaveMemory failed:', error)
        return []
    }
}

/**
 * Get raw memory array for programmatic use.
 */
export async function getMemoryArray(userId: string): Promise<MemoryFact[]> {
    return getUserMemories(userId)
}