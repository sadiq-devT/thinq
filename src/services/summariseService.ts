export interface SessionSummary {
    line1: string
    line2: string
    line3: string
    tags: string[]
    oneWordMood: string
}

interface AIClientMessage {
    role: 'user' | 'assistant'
    content: string
}

export async function summariseSession(
    messages: AIClientMessage[]
): Promise<SessionSummary> {
    try {
        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/summarise`,
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
        return data as SessionSummary
    } catch (error) {
        // Fallback summary on any error
        return {
            line1: 'A thinking session about what was on your mind.',
            line2: 'Something worth reflecting on emerged during the conversation.',
            line3: 'A thread to revisit in your next session.',
            tags: ['reflection'],
            oneWordMood: 'thoughtful',
        }
    }
}

export function formatTagsForSession(tags: string[]): string[] {
    return tags.map((t) => t.toLowerCase().trim()).slice(0, 3)
}

export function parseMoodFromSummary(oneWordMood: string): string {
    const validMoods = ['heavy', 'clear', 'tangled', 'hopeful', 'anxious', 'unresolved', 'grounded', 'reflective', 'confused', 'calm']
    return validMoods.includes(oneWordMood.toLowerCase()) ? oneWordMood : 'thoughtful'
}